const express = require("express");
const supabase = require("../../../config/supabaseClient");
const router = express.Router();

router.post("/timeConfig", async (req, res) => {
  try {
    const { data, error } = await supabase.from("time_config").select("*");
    if (error) throw error;

    res.json({
      status: "success",
      message: "Time configs fetched successfully.",
      data,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: "Failed to fetch time configs.",
      error: error.message || error,
    });
  }
});
router.post("/update-time-config/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, start_time, end_time } = req.body.body || req.body;

    const { data, error } = await supabase
      .from("time_config")
      .update({ title, start_time, end_time })
      .eq("id", id);
    if (error) throw error;

    res.json({
      status: "success",
      message: "Time config updated successfully.",
      data,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: "Failed to update time config.",
      error: error.message || error,
    });
  }
});

module.exports = router;
