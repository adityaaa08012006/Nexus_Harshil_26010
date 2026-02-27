// Gemini AI Configuration
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

console.log("═══════════════════════════════════════════════════════════");
console.log("🔑 GEMINI API KEY CHECK:");
console.log("   - API Key exists:", !!apiKey);
if (apiKey) {
  console.log("   - API Key length:", apiKey.length);
  console.log("   - API Key prefix:", apiKey.substring(0, 10) + "...");
} else {
  console.error("   ❌ GEMINI_API_KEY NOT FOUND in environment variables!");
  console.error("   ❌ PDF parsing will NOT work without this key.");
  console.error("   📝 Please create a .env file in the server directory.");
  console.error("   📝 Copy .env.example and add your Gemini API key.");
}
console.log("═══════════════════════════════════════════════════════════");

// Initialize Gemini AI
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Get generative model
export const getGeminiModel = (modelName = "gemini-2.5-flash") => {
  console.log(`\n[GEMINI] Getting model: ${modelName}`);

  if (!genAI) {
    const errorMsg =
      "❌ Gemini AI not initialized. GEMINI_API_KEY is missing in .env file!";
    console.error(`[GEMINI ERROR] ${errorMsg}`);
    throw new Error(errorMsg);
  }

  console.log("[GEMINI] ✅ Model initialized successfully");
  return genAI.getGenerativeModel({ model: modelName });
};

// Parse agricultural requirement text with Gemini
export const parseRequirementWithGemini = async (text) => {
  console.log("\n[GEMINI PARSE] ═══════════════════════════════════════");
  console.log("[GEMINI PARSE] Starting requirement parsing...");
  console.log(`[GEMINI PARSE] Text length: ${text.length} characters`);

  try {
    console.log("[GEMINI PARSE] Initializing Gemini model...");
    const model = getGeminiModel();
    console.log("[GEMINI PARSE] ✅ Model ready");

    const prompt = `You are an expert agricultural supply chain analyst. Parse the following text which contains agricultural product requirements or orders. Extract ALL items mentioned with their details.

IMPORTANT INSTRUCTIONS:
- Extract EVERY product/crop mentioned in the text
- Return a valid JSON array with no markdown formatting
- Each item should include: crop, variety (if mentioned), quantity, unit, location, deadline (if mentioned), grade/quality (if mentioned), notes
- Common agricultural products: Rice, Wheat, Maize, Pulses, Vegetables (Tomato, Onion, Potato, etc.), Fruits (Mango, Apple, Banana, etc.), Spices, Oilseeds, Cotton, Sugarcane, etc.
- Common units: kg, quintal, tonne, bags, crates, boxes
- Infer reasonable values if explicit data is missing
- Convert all quantities to standard units (kg preferred)
- Extract quality specifications (Grade A, Premium, Organic, etc.)
- Extract delivery location or destination
- Extract urgency or deadline information

Return ONLY a JSON array in this exact format with no additional text:
[
  {
    "crop": "Crop name",
    "variety": "Variety name or null",
    "quantity": 1000,
    "unit": "kg",
    "location": "Delivery location",
    "deadline": "YYYY-MM-DD or null",
    "grade": "Quality grade or null",
    "notes": "Additional specifications",
    "confidence": 0.95
  }
]

Text to parse:
"""
${text}
"""`;

    console.log("[GEMINI PARSE] Sending request to Gemini API...");
    const result = await model.generateContent(prompt);
    console.log("[GEMINI PARSE] ✅ Received response from Gemini");

    const response = result.response;
    const responseText = response.text();
    console.log(
      `[GEMINI PARSE] Response length: ${responseText.length} characters`,
    );
    console.log(
      `[GEMINI PARSE] Response preview: ${responseText.substring(0, 200)}...`,
    );

    // Clean the response - remove markdown code blocks if present
    let cleanedText = responseText.trim();
    if (cleanedText.startsWith("```json")) {
      cleanedText = cleanedText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "");
    } else if (cleanedText.startsWith("```")) {
      cleanedText = cleanedText.replace(/```\n?/g, "");
    }

    // Parse JSON
    console.log("[GEMINI PARSE] Parsing JSON response...");
    const parsedData = JSON.parse(cleanedText);
    const items = Array.isArray(parsedData) ? parsedData : [parsedData];

    console.log(`[GEMINI PARSE] ✅ Successfully parsed ${items.length} items`);
    console.log("[GEMINI PARSE] ═══════════════════════════════════════\n");

    return {
      success: true,
      items,
      rawResponse: responseText,
    };
  } catch (error) {
    console.error("\n[GEMINI PARSE ERROR] ═══════════════════════════════");
    console.error("[GEMINI PARSE ERROR] Failed to parse requirements");
    console.error("[GEMINI PARSE ERROR] Error type:", error.constructor.name);
    console.error("[GEMINI PARSE ERROR] Error message:", error.message);

    if (error.stack) {
      console.error("[GEMINI PARSE ERROR] Stack trace:");
      console.error(error.stack);
    }

    // Log additional details for common error types
    if (error.message.includes("API key")) {
      console.error("\n[GEMINI PARSE ERROR] 🔑 API KEY ISSUE DETECTED!");
      console.error("[GEMINI PARSE ERROR] Please verify:");
      console.error(
        "[GEMINI PARSE ERROR]   1. .env file exists in server directory",
      );
      console.error(
        "[GEMINI PARSE ERROR]   2. GEMINI_API_KEY is set correctly",
      );
      console.error(
        "[GEMINI PARSE ERROR]   3. API key is valid and has permissions",
      );
    }
    if (error.message.includes("not found") || error.message.includes("404")) {
      console.error("\n[GEMINI PARSE ERROR] 🤖 MODEL NOT FOUND!");
      console.error(
        "[GEMINI PARSE ERROR] The requested Gemini model is not available.",
      );
      console.error(
        "[GEMINI PARSE ERROR] Available models: gemini-2.5-flash, gemini-2.5-pro, gemini-2.5-flash-lite",
      );
    }
    console.error("[GEMINI PARSE ERROR] ═══════════════════════════════\n");

    return {
      success: false,
      error: error.message,
      items: [],
    };
  }
};

// Extract text from PDF (you'll need pdf-parse library)
export const extractTextFromPDF = async (pdfBuffer) => {
  console.log("\n[PDF EXTRACT] ═══════════════════════════════════════");
  console.log("[PDF EXTRACT] Starting text extraction from PDF...");
  console.log(`[PDF EXTRACT] Buffer size: ${pdfBuffer.length} bytes`);

  try {
    console.log("[PDF EXTRACT] Initializing Gemini model...");
    const model = getGeminiModel();
    console.log("[PDF EXTRACT] ✅ Model ready");

    // Convert PDF to base64 for Gemini
    console.log("[PDF EXTRACT] Converting PDF to base64...");
    const base64Data = pdfBuffer.toString("base64");
    console.log(`[PDF EXTRACT] Base64 length: ${base64Data.length} characters`);

    console.log("[PDF EXTRACT] Sending PDF to Gemini API...");
    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: "application/pdf",
          data: base64Data,
        },
      },
      "Extract all text content from this PDF document. Return only the text, no formatting or additional commentary.",
    ]);

    console.log("[PDF EXTRACT] ✅ Received response from Gemini");

    const text = result.response.text();
    console.log(
      `[PDF EXTRACT] Extracted text length: ${text.length} characters`,
    );
    console.log(`[PDF EXTRACT] Text preview: ${text.substring(0, 150)}...`);
    console.log("[PDF EXTRACT] ✅ Extraction completed successfully");
    console.log("[PDF EXTRACT] ═══════════════════════════════════════\n");

    return { success: true, text };
  } catch (error) {
    console.error("\n[PDF EXTRACT ERROR] ═══════════════════════════════");
    console.error("[PDF EXTRACT ERROR] Failed to extract text from PDF");
    console.error("[PDF EXTRACT ERROR] Error type:", error.constructor.name);
    console.error("[PDF EXTRACT ERROR] Error message:", error.message);

    if (error.stack) {
      console.error("[PDF EXTRACT ERROR] Stack trace:");
      console.error(error.stack);
    }

    if (error.message.includes("API key")) {
      console.error("\n[PDF EXTRACT ERROR] 🔑 API KEY ISSUE DETECTED!");
      console.error(
        "[PDF EXTRACT ERROR] Your Gemini API key may be invalid or missing.",
      );
    }
    if (error.message.includes("not found") || error.message.includes("404")) {
      console.error("\n[PDF EXTRACT ERROR] 🤖 MODEL NOT FOUND!");
      console.error(
        "[PDF EXTRACT ERROR] The Gemini model may not be available.",
      );
      console.error(
        "[PDF EXTRACT ERROR] Try these models: gemini-2.5-flash, gemini-2.5-pro, gemini-2.5-flash-lite",
      );
    }
    console.error("[PDF EXTRACT ERROR] ═══════════════════════════════\n");

    return { success: false, error: error.message, text: "" };
  }
};

// Extract text from image (JPEG, PNG) using OCR
export const extractTextFromImage = async (imageBuffer, mimeType) => {
  console.log("\n[IMAGE EXTRACT] ═══════════════════════════════════════");
  console.log("[IMAGE EXTRACT] Starting text extraction from image...");
  console.log(`[IMAGE EXTRACT] Buffer size: ${imageBuffer.length} bytes`);
  console.log(`[IMAGE EXTRACT] MIME type: ${mimeType}`);

  try {
    console.log("[IMAGE EXTRACT] Initializing Gemini model...");
    const model = getGeminiModel();
    console.log("[IMAGE EXTRACT] ✅ Model ready");

    // Convert image to base64 for Gemini
    console.log("[IMAGE EXTRACT] Converting image to base64...");
    const base64Data = imageBuffer.toString("base64");
    console.log(
      `[IMAGE EXTRACT] Base64 length: ${base64Data.length} characters`,
    );

    console.log("[IMAGE EXTRACT] Sending image to Gemini API for OCR...");
    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: mimeType,
          data: base64Data,
        },
      },
      "Extract all text content from this image using OCR. Return only the text you see in the image, no formatting or additional commentary. If the image contains a table, extract all data in a structured way. If it's a document/form, extract all visible text.",
    ]);

    console.log("[IMAGE EXTRACT] ✅ Received response from Gemini");

    const text = result.response.text();
    console.log(
      `[IMAGE EXTRACT] Extracted text length: ${text.length} characters`,
    );
    console.log(`[IMAGE EXTRACT] Text preview: ${text.substring(0, 150)}...`);
    console.log("[IMAGE EXTRACT] ✅ Extraction completed successfully");
    console.log("[IMAGE EXTRACT] ═══════════════════════════════════════\n");

    return { success: true, text };
  } catch (error) {
    console.error("\n[IMAGE EXTRACT ERROR] ═══════════════════════════════");
    console.error("[IMAGE EXTRACT ERROR] Failed to extract text from image");
    console.error("[IMAGE EXTRACT ERROR] Error type:", error.constructor.name);
    console.error("[IMAGE EXTRACT ERROR] Error message:", error.message);

    if (error.stack) {
      console.error("[IMAGE EXTRACT ERROR] Stack trace:");
      console.error(error.stack);
    }

    if (error.message.includes("API key")) {
      console.error("\n[IMAGE EXTRACT ERROR] 🔑 API KEY ISSUE DETECTED!");
      console.error(
        "[IMAGE EXTRACT ERROR] Your Gemini API key may be invalid or missing.",
      );
    }
    if (error.message.includes("not found") || error.message.includes("404")) {
      console.error("\n[IMAGE EXTRACT ERROR] 🤖 MODEL NOT FOUND!");
      console.error(
        "[IMAGE EXTRACT ERROR] The Gemini model may not be available.",
      );
      console.error(
        "[IMAGE EXTRACT ERROR] Try these models: gemini-2.5-flash, gemini-2.5-pro, gemini-2.5-flash-lite",
      );
    }
    console.error("[IMAGE EXTRACT ERROR] ═══════════════════════════════\n");

    return { success: false, error: error.message, text: "" };
  }
};

export default {
  getGeminiModel,
  parseRequirementWithGemini,
  extractTextFromPDF,
  extractTextFromImage,
};
