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

router.post("/createBuilding", async (req, res) => {
  try {
    const building = req.body.body || req.body;
    const { data, error } = await supabase
      .from("buildings")
      .insert([building])
      .select();
    if (error) throw error;

    res.status(201).json({
      status: "success",
      message: "Building created successfully.",
      data,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create building",
      error: error.message,
      status: "fail",
    });
  }
});

router.post("/updateBuilding/:buildingId", async (req, res) => {
  const { buildingId } = req.params;
  const updatedBuildingData = req.body.body || req.body;

  try {
    const { data, error } = await supabase
      .from("buildings")
      .update(updatedBuildingData)
      .eq("id", buildingId)
      .select();

    if (error) throw error;

    res.status(200).json({
      status: "success",
      message: "Building updated successfully.",
      data,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: "Failed to update building.",
      error: error.message || error,
    });
  }
});

router.post("/deleteBuilding/:buildingId", async (req, res) => {
  const { buildingId } = req.params;

  try {
    const { data, error } = await supabase
      .from("buildings")
      .delete()
      .eq("id", buildingId);
    if (error) throw error;

    res.status(200).json({
      status: "success",
      message: "Building deleted successfully.",
      data,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: "Failed to delete building.",
      error: error.message || error,
    });
  }
});

module.exports = router;
