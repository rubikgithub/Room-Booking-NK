const express = require("express");

const supabase = require("../../../config/supabaseClient");
const router = express.Router();

router.post("/rooms", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("rooms")
      .select(`*, building:buildings(name)`);

    // if (error) throw error;

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
    // if (error) throw error;
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

router.post("/createRoom", async (req, res) => {
  const room = req.body.body || req.body;

  try {
    const { data, error } = await supabase
      .from("rooms")
      .insert([room])
      .select();
    if (error) throw error;

    res.status(201).json({
      status: "success",
      message: "Room created successfully.",
      data,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: "Failed to create room.",
      error: error.message || error,
    });
  }
});

router.post("/deleteRoom/:roomId", async (req, res) => {
  const { roomId } = req.params;

  try {
    await supabase.from("rooms").delete().eq("id", roomId);

    res.status(200).json({
      status: "success",
      message: "Room deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: "Failed to delete room.",
      error: error.message || error,
    });
  }
});

router.post("/updateRoom/:roomId", async (req, res) => {
  const { roomId } = req.params;
  const updatedRoomData = req.body.body || req.body;

  try {
    const { data, error } = await supabase
      .from("rooms")
      .update(updatedRoomData)
      .eq("id", roomId)
      .select();

    if (error) throw error;

    res.status(200).json({
      status: "success",
      message: "Room updated successfully.",
      data,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: "Failed to update room.",
      error: error.message || error,
    });
  }
});
router.post("/rooms-by-building", async (req, res) => {
  const { buildingIds } = req.body.body;

  try {
    if (
      !buildingIds ||
      !Array.isArray(buildingIds) ||
      buildingIds.length === 0
    ) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid request. Please provide an array of building IDs.",
      });
    }

    const { data, error } = await supabase
      .from("rooms")
      .select(`*, building:buildings(name)`)
      .in("building_id", buildingIds);

    if (error) {
      return res.status(500).json({
        status: "fail",
        message: "Failed to fetch rooms by building IDs.",
        error: error.message || error,
      });
    }

    const processedData = data.map((room) => ({
      ...room,
      building_name: room.building?.name || null,
    }));

    if (processedData.length === 0) {
      return res.status(404).json({
        status: "fail",
        message: "No rooms found for the provided building IDs.",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Rooms fetched successfully.",
      data: processedData,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: "An error occurred while fetching rooms.",
      error: error.message || error,
    });
  }
});
router.post("/buildings-by-id", async (req, res) => {
  try {
    const { buildingIds } = req.body.body || req.body;

    if (
      !buildingIds ||
      !Array.isArray(buildingIds) ||
      buildingIds.length === 0
    ) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid request. Please provide an array of building IDs.",
      });
    }

    const { data, error } = await supabase
      .from("buildings")
      .select("*")
      .in("id", buildingIds);

    if (error) {
      return res.status(500).json({
        status: "fail",
        message: "Failed to fetch buildings.",
        error: error.message || error,
      });
    }

    if (data.length === 0) {
      return res.status(404).json({
        status: "fail",
        message: "No buildings found for the provided IDs.",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Buildings fetched successfully.",
      data,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: "An error occurred while fetching buildings.",
      error: error.message || error,
    });
  }
});

module.exports = router;
