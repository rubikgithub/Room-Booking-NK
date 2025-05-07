const express = require("express");

const supabase = require("../../../config/supabaseClient");
const router = express.Router();

router.post("/rooms", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("rooms")
      .select(`*, building:buildings(name)`);

    if (error) throw error;

    const processedData = data.map((room) => ({
      ...room,
      building_name: room.building?.name || null,
    }));

    res.status(200).json({
      status: "success",
      message: "Rooms fetched successfully.",
      data: processedData,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch users", error: error.message });
  }
});

router.post("/buildings", async (req, res) => {
  try {
    const { data, error } = await supabase.from("buildings").select("*");
    if (error) throw error;
    res.status(200).json({
      status: "success",
      message: "Buildings fetched successfully.",
      data,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch users", error: error.message });
  }
});

module.exports = router;
