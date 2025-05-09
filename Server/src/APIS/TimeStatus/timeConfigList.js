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

module.exports = router;
