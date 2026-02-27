// PDF Parsing Routes with Gemini AI
import express from "express";
import multer from "multer";
import {
  extractTextFromPDF,
  parseRequirementWithGemini,
} from "../config/gemini.js";
import { supabase, supabaseAdmin } from "../config/supabase.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// Configure multer for file upload (store in memory)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["application/pdf"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"), false);
    }
  },
});

// ── POST /api/pdf-parse/upload ─────────────────────────────────────────────
// Upload PDF and parse with Gemini AI
router.post("/upload", requireAuth, upload.single("pdf"), async (req, res) => {
  const logPrefix = "[PDF UPLOAD]";

  try {
    console.log(`${logPrefix} Received upload request from user:`, req.user.id);

    if (!req.file) {
      return res.status(400).json({ error: "No PDF file uploaded" });
    }

    const userId = req.user.id;
    const pdfBuffer = req.file.buffer;
    const originalName = req.file.originalname;

    console.log(
      `${logPrefix} File received:`,
      originalName,
      `(${req.file.size} bytes)`,
    );

    // Step 1: Extract text from PDF using Gemini
    console.log(`${logPrefix} Extracting text from PDF...`);
    const extractionResult = await extractTextFromPDF(pdfBuffer);

    if (!extractionResult.success) {
      return res.status(500).json({
        error: "Failed to extract text from PDF",
        details: extractionResult.error,
      });
    }

    console.log(
      `${logPrefix} Text extracted successfully (${extractionResult.text.length} characters)`,
    );

    // Step 2: Parse requirements with Gemini
    console.log(`${logPrefix} Parsing requirements with Gemini AI...`);
    const parseResult = await parseRequirementWithGemini(extractionResult.text);

    if (!parseResult.success) {
      return res.status(500).json({
        error: "Failed to parse requirements",
        details: parseResult.error,
      });
    }

    console.log(
      `${logPrefix} Parsed ${parseResult.items.length} items successfully`,
    );

    // Step 3: Return parsed data for user review (DO NOT save yet)
    console.log(`${logPrefix} Returning parsed data for user review`);

    res.json({
      success: true,
      message: "PDF parsed successfully - review items before saving",
      filename: originalName,
      extractedText: extractionResult.text,
      items: parseResult.items,
      itemCount: parseResult.items.length,
      rawResponse: parseResult.rawResponse,
    });
  } catch (error) {
    console.error(`${logPrefix} Error:`, error);
    res.status(500).json({
      error: "Failed to process PDF",
      message: error.message,
    });
  }
});

// ── POST /api/pdf-parse/save ───────────────────────────────────────────────
// Save reviewed/edited requirements to database
router.post("/save", requireAuth, async (req, res) => {
  const logPrefix = "[SAVE PARSED]";

  try {
    const userId = req.user.id;
    const { filename, extractedText, items, rawResponse } = req.body;

    console.log(`${logPrefix} Saving reviewed requirements for user:`, userId);
    console.log(
      `${logPrefix} Filename: ${filename}, Items: ${items?.length || 0}`,
    );

    // Validate input
    if (!filename || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: "Invalid request - filename and items array required",
      });
    }

    // Validate items have required fields
    const invalidItems = items.filter(
      (item) => !item.crop || !item.quantity || parseFloat(item.quantity) <= 0,
    );
    if (invalidItems.length > 0) {
      return res.status(400).json({
        error: "All items must have valid crop and quantity",
      });
    }

    // Save to database
    const parsedDataRecord = {
      user_id: userId,
      filename: filename,
      extracted_text: extractedText || null,
      parsed_items: items,
      raw_response: rawResponse || null,
      status: "draft",
      created_at: new Date().toISOString(),
    };

    const { data: savedRecord, error: dbError } = await supabaseAdmin
      .from("parsed_requirements")
      .insert([parsedDataRecord])
      .select()
      .single();

    if (dbError) {
      console.error(`${logPrefix} Database error:`, dbError);
      return res.status(500).json({
        error: "Failed to save parsed data",
        details: dbError.message,
      });
    }

    console.log(`${logPrefix} Saved successfully with ID:`, savedRecord.id);

    res.json({
      success: true,
      message: "Requirements saved successfully",
      id: savedRecord.id,
      itemCount: items.length,
    });
  } catch (error) {
    console.error(`${logPrefix} Error:`, error);
    res.status(500).json({
      error: "Failed to save requirements",
      message: error.message,
    });
  }
});

// ── GET /api/pdf-parse/parsed/:id ──────────────────────────────────────────
// Get parsed data by ID
router.get("/parsed/:id", requireAuth, async (req, res) => {
  const logPrefix = "[GET PARSED]";

  try {
    const { id } = req.params;
    const userId = req.user.id;

    console.log(`${logPrefix} Fetching parsed data:`, id);

    const { data, error } = await supabase
      .from("parsed_requirements")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: "Parsed data not found" });
    }

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(`${logPrefix} Error:`, error);
    res.status(500).json({ error: error.message });
  }
});

// ── PUT /api/pdf-parse/update/:id ──────────────────────────────────────────
// Update parsed items (after user edits)
router.put("/update/:id", requireAuth, async (req, res) => {
  const logPrefix = "[UPDATE PARSED]";

  try {
    const { id } = req.params;
    const { items } = req.body;
    const userId = req.user.id;

    console.log(`${logPrefix} Updating parsed data:`, id);

    if (!Array.isArray(items)) {
      return res.status(400).json({ error: "Items must be an array" });
    }

    const { data, error } = await supabaseAdmin
      .from("parsed_requirements")
      .update({
        parsed_items: items,
        status: "edited",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error || !data) {
      console.error(`${logPrefix} Update error:`, error);
      return res.status(404).json({ error: "Failed to update parsed data" });
    }

    console.log(`${logPrefix} Updated successfully`);

    res.json({
      success: true,
      message: "Parsed data updated successfully",
      data,
    });
  } catch (error) {
    console.error(`${logPrefix} Error:`, error);
    res.status(500).json({ error: error.message });
  }
});

// ── POST /api/pdf-parse/publish/:id ────────────────────────────────────────
// Publish parsed items as allocation requests
router.post("/publish/:id", requireAuth, async (req, res) => {
  const logPrefix = "[PUBLISH]";

  try {
    const { id } = req.params;
    const userId = req.user.id;

    console.log(`${logPrefix} Publishing parsed data:`, id);

    // Get parsed data
    const { data: parsedData, error: fetchError } = await supabase
      .from("parsed_requirements")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (fetchError || !parsedData) {
      return res.status(404).json({ error: "Parsed data not found" });
    }

    // Create allocation requests for each item
    const allocationRequests = parsedData.parsed_items.map((item, index) => ({
      request_id: `REQ-${Date.now()}-${index}`,
      requester_id: userId,
      crop: item.crop,
      variety: item.variety || null,
      quantity: parseFloat(item.quantity) || 0,
      unit: item.unit || "kg",
      deadline: item.deadline ? new Date(item.deadline).toISOString() : null,
      location: item.location || "Not specified",
      price: item.price ? parseFloat(item.price) : null,
      status: "pending",
      notes: item.notes || (item.grade ? `Grade: ${item.grade}` : null),
      created_at: new Date().toISOString(),
    }));

    console.log(
      `${logPrefix} Creating ${allocationRequests.length} allocation requests...`,
    );

    const { data: createdRequests, error: insertError } = await supabaseAdmin
      .from("allocation_requests")
      .insert(allocationRequests)
      .select();

    if (insertError) {
      console.error(`${logPrefix} Insert error:`, insertError);
      return res.status(500).json({
        error: "Failed to create allocation requests",
        details: insertError.message,
      });
    }

    // Update parsed data status to published
    await supabaseAdmin
      .from("parsed_requirements")
      .update({
        status: "published",
        published_at: new Date().toISOString(),
      })
      .eq("id", id);

    console.log(
      `${logPrefix} Successfully published ${createdRequests.length} requests`,
    );

    res.json({
      success: true,
      message: `Successfully created ${createdRequests.length} allocation requests`,
      requests: createdRequests,
      count: createdRequests.length,
    });
  } catch (error) {
    console.error(`${logPrefix} Error:`, error);
    res.status(500).json({ error: error.message });
  }
});

// ── GET /api/pdf-parse/history ─────────────────────────────────────────────
// Get user's upload history
router.get("/history", requireAuth, async (req, res) => {
  const logPrefix = "[HISTORY]";

  try {
    const userId = req.user.id;

    console.log(`${logPrefix} Fetching upload history for user:`, userId);

    const { data, error } = await supabase
      .from("parsed_requirements")
      .select("id, filename, status, created_at, parsed_items")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error(`${logPrefix} Error:`, error);
      return res.status(500).json({ error: error.message });
    }

    res.json({
      success: true,
      history: data.map((record) => ({
        ...record,
        itemCount: record.parsed_items?.length || 0,
      })),
    });
  } catch (error) {
    console.error(`${logPrefix} Error:`, error);
    res.status(500).json({ error: error.message });
  }
});

// ── DELETE /api/pdf-parse/:id ──────────────────────────────────────────────
// Delete parsed data
router.delete("/:id", requireAuth, async (req, res) => {
  const logPrefix = "[DELETE PARSED]";

  try {
    const { id } = req.params;
    const userId = req.user.id;

    console.log(`${logPrefix} Deleting parsed data:`, id);

    const { error } = await supabaseAdmin
      .from("parsed_requirements")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      console.error(`${logPrefix} Delete error:`, error);
      return res.status(500).json({ error: "Failed to delete parsed data" });
    }

    res.json({
      success: true,
      message: "Parsed data deleted successfully",
    });
  } catch (error) {
    console.error(`${logPrefix} Error:`, error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
