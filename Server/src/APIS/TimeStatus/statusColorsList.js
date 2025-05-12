const express = require("express");
const supabase = require("../../../config/supabaseClient");
const router = express.Router();

router.post("/statusColors", async (req, res) => {
  try {
    const { data, error } = await supabase.from("status_colors").select("*");

    if (error) throw error;

    res.json({
      status: "success",
      message: "Status colors fetched successfully.",
      data,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: "Failed to fetch status colors.",
      error: error.message || error,
    });
  }
});

router.post("/update-status-color", async (req, res) => {
  const { id, color } = req.body.body || req.body;

  try {
    const { data, error } = await supabase
      .from("status_colors")
      .update({ color })
      .eq("id", id);

    if (error) throw error;

    res.json({
      status: "success",
      message: "Status color updated successfully.",
      data,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: "Failed to update status color.",
      error: error.message || error,
    });
  }
});

module.exports = router;
