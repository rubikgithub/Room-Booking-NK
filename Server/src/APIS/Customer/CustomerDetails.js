const express = require("express");

const supabase = require("../../../config/supabaseClient");
const router = express.Router();

router.post("/users", async (req, res) => {
  try {
    const { data, error } = await supabase.from("users").select("*");
    if (error) throw error;
    res.status(200).json({
      status: "success",
      message: "Users fetched successfully.",
      data,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch users", error: error.message });
  }
});

module.exports = router;
