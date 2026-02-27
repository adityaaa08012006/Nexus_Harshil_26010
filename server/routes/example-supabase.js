import express from "express";
import { supabase } from "../config/supabase.js";

const router = express.Router();

/**
 * Example Supabase Routes
 * Replace these with your actual table names and logic
 */

// Get all items from a table
router.get("/example", async (req, res) => {
  try {
    const { data, error } = await supabase.from("your_table_name").select("*");

    if (error) throw error;

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get a single item by ID
router.get("/example/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("your_table_name")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Create a new item
router.post("/example", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("your_table_name")
      .insert([req.body])
      .select();

    if (error) throw error;

    res.status(201).json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Update an item
router.put("/example/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("your_table_name")
      .update(req.body)
      .eq("id", id)
      .select();

    if (error) throw error;

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Delete an item
router.delete("/example/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from("your_table_name")
      .delete()
      .eq("id", id);

    if (error) throw error;

    res.json({
      success: true,
      message: "Item deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
