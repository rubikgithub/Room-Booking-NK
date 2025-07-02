const express = require("express");
const supabase = require("../../../config/supabaseClient");
const router = express.Router();

router.post("/rooms", async (req, res) => {
  try {
    const { status, building_id, type, capacity_min, capacity_max } = req.query;

    let query = supabase
      .from("rooms")
      .select(`*, building:buildings(name, location)`);

    if (status) {
      query = query.eq("status", status);
    }
    if (building_id) {
      query = query.eq("building_id", building_id);
    }
    if (type) {
      query = query.eq("type", type);
    }
    if (capacity_min) {
      query = query.gte("capacity", capacity_min);
    }
    if (capacity_max) {
      query = query.lte("capacity", capacity_max);
    }

    const { data, error } = await query.order("name");

    if (error) throw error;

    const processedData = data.map((room) => ({
      ...room,
      building_name: room.building?.name || null,
      building_location: room.building?.location || null,
    }));

    res.status(200).json({
      status: "success",
      message: "Rooms fetched successfully.",
      data: processedData,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to fetch rooms",
      error: error.message,
    });
  }
});

router.post("/buildings", async (req, res) => {
  try {
    const { status } = req.query;

    let query = supabase.from("buildings").select("*");

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query.order("name");

    if (error) throw error;

    res.status(200).json({
      status: "success",
      message: "Buildings fetched successfully.",
      data,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to fetch buildings",
      error: error.message,
    });
  }
});

router.post("/createBuilding", async (req, res) => {
  try {
    const building = req.body.body || req.body;

    if (!building.name || !building.location) {
      return res.status(400).json({
        status: "error",
        message: "Name and location are required fields.",
      });
    }

    const { data, error } = await supabase
      .from("buildings")
      .insert([building])
      .select();

    if (error) throw error;

    res.status(201).json({
      status: "success",
      message: "Building created successfully.",
      data: data[0],
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to create building",
      error: error.message,
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

    if (!data || data.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Building not found.",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Building updated successfully.",
      data: data[0],
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to update building.",
      error: error.message || error,
    });
  }
});

router.post("/deleteBuilding/:buildingId", async (req, res) => {
  const { buildingId } = req.params;

  try {
    // Check if building has rooms
    const { data: rooms, error: roomsError } = await supabase
      .from("rooms")
      .select("id")
      .eq("building_id", buildingId);

    if (roomsError) throw roomsError;

    if (rooms && rooms.length > 0) {
      return res.status(400).json({
        status: "error",
        message: "Cannot delete building. It has associated rooms.",
      });
    }

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
      status: "error",
      message: "Failed to delete building.",
      error: error.message || error,
    });
  }
});

router.post("/createRoom", async (req, res) => {
  const room = req.body.body || req.body;

  try {
    // Validate required fields
    if (!room.name || !room.type || !room.capacity || !room.building_id) {
      return res.status(400).json({
        status: "error",
        message: "Name, type, capacity, and building_id are required fields.",
      });
    }

    // Validate building exists
    const { data: building, error: buildingError } = await supabase
      .from("buildings")
      .select("id")
      .eq("id", room.building_id)
      .single();

    if (buildingError || !building) {
      return res.status(400).json({
        status: "error",
        message: "Invalid building_id. Building does not exist.",
      });
    }

    const { data, error } = await supabase
      .from("rooms")
      .insert([room])
      .select(`*, building:buildings(name, location)`);

    if (error) throw error;

    const processedData = {
      ...data[0],
      building_name: data[0].building?.name || null,
      building_location: data[0].building?.location || null,
    };

    res.status(201).json({
      status: "success",
      message: "Room created successfully.",
      data: processedData,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to create room.",
      error: error.message || error,
    });
  }
});
router.post("/deleteRoom/:roomId", async (req, res) => {
  const { roomId } = req.params;

  if (!roomId) {
    return res.status(400).json({
      status: "error",
      message: "Room ID is required.",
    });
  }

  try {
    const { data: roomExists, error: roomError } = await supabase
      .from("rooms")
      .select("id")
      .eq("id", roomId)
      .single();

    if (roomError) {
      return res.status(500).json({
        status: "error",
        message: "Error checking room existence.",
        error: roomError.message,
      });
    }

    if (!roomExists) {
      return res.status(404).json({
        status: "error",
        message: "Room not found.",
      });
    }

    const { data: bookings, error: bookingsError } = await supabase
      .from("bookings")
      .select("id")
      .eq("room_id", roomId)
      .eq("status", "Booked");

    if (bookingsError) {
      return res.status(500).json({
        status: "error",
        message: "Error checking room bookings.",
        error: bookingsError.message,
      });
    }

    if (bookings && bookings.length > 0) {
      return res.status(400).json({
        status: "error",
        message: "Cannot delete room. It has confirmed bookings.",
      });
    }

    const { error: deleteError } = await supabase
      .from("rooms")
      .delete()
      .eq("id", roomId);

    if (deleteError) {
      return res.status(500).json({
        status: "error",
        message: "Failed to delete room.",
        error: deleteError.message,
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Room deleted successfully.",
    });

  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Unexpected server error.",
      error: error.message || error,
    });
  }
});


router.post("/updateRoom/:roomId", async (req, res) => {
  const { roomId } = req.params;
  const updatedRoomData = req.body.body || req.body;

  try {
    if (updatedRoomData.building_id) {
      const { data: building, error: buildingError } = await supabase
        .from("buildings")
        .select("id")
        .eq("id", updatedRoomData.building_id)
        .single();

      if (buildingError || !building) {
        return res.status(400).json({
          status: "error",
          message: "Invalid building_id. Building does not exist.",
        });
      }
    }

    const { data, error } = await supabase
      .from("rooms")
      .update(updatedRoomData)
      .eq("id", roomId)
      .select(`*, building:buildings(name, location)`);

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Room not found.",
      });
    }

    const processedData = {
      ...data[0],
      building_name: data[0].building?.name || null,
      building_location: data[0].building?.location || null,
    };

    res.status(200).json({
      status: "success",
      message: "Room updated successfully.",
      data: processedData,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
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
        status: "error",
        message: "Invalid request. Please provide an array of building IDs.",
      });
    }

    const { data, error } = await supabase
      .from("rooms")
      .select(`*, building:buildings(name, location)`)
      .in("building_id", buildingIds)
      .order("name");

    if (error) throw error;

    const processedData = data.map((room) => ({
      ...room,
      building_name: room.building?.name || null,
      building_location: room.building?.location || null,
    }));

    res.status(200).json({
      status: "success",
      message: "Rooms fetched successfully.",
      data: processedData,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
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
        status: "error",
        message: "Invalid request. Please provide an array of building IDs.",
      });
    }

    const { data, error } = await supabase
      .from("buildings")
      .select("*")
      .in("id", buildingIds)
      .order("name");

    if (error) throw error;

    res.status(200).json({
      status: "success",
      message: "Buildings fetched successfully.",
      data,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "An error occurred while fetching buildings.",
      error: error.message || error,
    });
  }
});

router.post("/building/:buildingId", async (req, res) => {
  try {
    const { buildingId } = req.params;

    const { data, error } = await supabase
      .from("buildings")
      .select("*")
      .eq("id", buildingId)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        status: "error",
        message: "Building not found.",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Building fetched successfully.",
      data,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to fetch building.",
      error: error.message,
    });
  }
});

// Get single room by ID
router.post("/room/:roomId", async (req, res) => {
  try {
    const { roomId } = req.params;

    const { data, error } = await supabase
      .from("rooms")
      .select(`*, building:buildings(name, location)`)
      .eq("id", roomId)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        status: "error",
        message: "Room not found.",
      });
    }

    const processedData = {
      ...data,
      building_name: data.building?.name || null,
      building_location: data.building?.location || null,
    };

    res.status(200).json({
      status: "success",
      message: "Room fetched successfully.",
      data: processedData,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to fetch room.",
      error: error.message,
    });
  }
});

router.post("/available-rooms", async (req, res) => {
  try {
    const { date, start_time, end_time, capacity_min, building_id } =
      req.body.body || req.body;

    if (!date || !start_time || !end_time) {
      return res.status(400).json({
        status: "error",
        message: "Date, start_time, and end_time are required.",
      });
    }

    let roomsQuery = supabase
      .from("rooms")
      .select(`*, building:buildings(name, location)`)
      .eq("status", "Active");

    if (capacity_min) {
      roomsQuery = roomsQuery.gte("capacity", capacity_min);
    }
    if (building_id) {
      roomsQuery = roomsQuery.eq("building_id", building_id);
    }

    const { data: allRooms, error: roomsError } = await roomsQuery;
    if (roomsError) throw roomsError;

    const { data: conflictingBookings, error: bookingsError } = await supabase
      .from("bookings")
      .select("room_id")
      .eq("date", date)
      .eq("status", "Confirmed")
      .or(
        `and(start_time.lte.${start_time},end_time.gt.${start_time}),and(start_time.lt.${end_time},end_time.gte.${end_time}),and(start_time.gte.${start_time},end_time.lte.${end_time})`
      );

    if (bookingsError) throw bookingsError;

    const bookedRoomIds = new Set(
      conflictingBookings?.map((b) => b.room_id) || []
    );

    // Filter available rooms
    const availableRooms = allRooms
      .filter((room) => !bookedRoomIds.has(room.id))
      .map((room) => ({
        ...room,
        building_name: room.building?.name || null,
        building_location: room.building?.location || null,
      }));

    res.status(200).json({
      status: "success",
      message: "Available rooms fetched successfully.",
      data: availableRooms,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to fetch available rooms.",
      error: error.message,
    });
  }
});

router.post("/room-types", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("rooms")
      .select("type")
      .eq("status", "Active");

    if (error) throw error;

    const uniqueTypes = [...new Set(data.map((room) => room.type))].filter(
      Boolean
    );

    res.status(200).json({
      status: "success",
      message: "Room types fetched successfully.",
      data: uniqueTypes,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to fetch room types.",
      error: error.message,
    });
  }
});

router.post("/buildings-with-room-count", async (req, res) => {
  try {
    const { data: buildings, error: buildingsError } = await supabase
      .from("buildings")
      .select("*")
      .eq("status", "Active")
      .order("name");

    if (buildingsError) throw buildingsError;

    const { data: roomCounts, error: roomsError } = await supabase
      .from("rooms")
      .select("building_id")
      .eq("status", "Active");

    if (roomsError) throw roomsError;

    const roomCountMap = {};
    roomCounts.forEach((room) => {
      roomCountMap[room.building_id] =
        (roomCountMap[room.building_id] || 0) + 1;
    });

    const buildingsWithCount = buildings.map((building) => ({
      ...building,
      room_count: roomCountMap[building.id] || 0,
    }));

    res.status(200).json({
      status: "success",
      message: "Buildings with room count fetched successfully.",
      data: buildingsWithCount,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to fetch buildings with room count.",
      error: error.message,
    });
  }
});

// Search rooms
router.post("/search-rooms", async (req, res) => {
  try {
    const { searchTerm, building_id, type, capacity_min, capacity_max } =
      req.body.body || req.body;

    if (!searchTerm || searchTerm.trim().length < 2) {
      return res.status(400).json({
        status: "error",
        message: "Search term must be at least 2 characters long.",
      });
    }

    let query = supabase
      .from("rooms")
      .select(`*, building:buildings(name, location)`)
      .eq("status", "Active")
      .ilike("name", `%${searchTerm.trim()}%`);

    if (building_id) {
      query = query.eq("building_id", building_id);
    }
    if (type) {
      query = query.eq("type", type);
    }
    if (capacity_min) {
      query = query.gte("capacity", capacity_min);
    }
    if (capacity_max) {
      query = query.lte("capacity", capacity_max);
    }

    const { data, error } = await query.order("name");

    if (error) throw error;

    const processedData = data.map((room) => ({
      ...room,
      building_name: room.building?.name || null,
      building_location: room.building?.location || null,
    }));

    res.status(200).json({
      status: "success",
      message: "Room search completed successfully.",
      data: processedData,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to search rooms.",
      error: error.message,
    });
  }
});

// Bulk update room status
router.post("/bulk-update-room-status", async (req, res) => {
  try {
    const { roomIds, status } = req.body.body || req.body;

    if (!roomIds || !Array.isArray(roomIds) || roomIds.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "Room IDs array is required.",
      });
    }

    if (!status || !["Active", "Inactive"].includes(status)) {
      return res.status(400).json({
        status: "error",
        message: "Status must be either 'Active' or 'Inactive'.",
      });
    }

    const { data, error } = await supabase
      .from("rooms")
      .update({ status })
      .in("id", roomIds)
      .select(`*, building:buildings(name, location)`);

    if (error) throw error;

    const processedData = data.map((room) => ({
      ...room,
      building_name: room.building?.name || null,
      building_location: room.building?.location || null,
    }));

    res.status(200).json({
      status: "success",
      message: `${data.length} rooms updated successfully.`,
      data: processedData,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to bulk update room status.",
      error: error.message,
    });
  }
});

// Get room booking history
router.post("/room-booking-history/:roomId", async (req, res) => {
  try {
    const { roomId } = req.params;
    const { limit = 50, page = 1 } = req.query;

    const offset = (page - 1) * limit;

    const { data, error } = await supabase
      .from("bookings")
      .select(
        `
        *,
        user:users!fk_user_id (first_name, last_name, department),
        rooms (name, building:buildings(name))
      `
      )
      .eq("room_id", roomId)
      .order("date", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    res.status(200).json({
      status: "success",
      message: "Room booking history fetched successfully.",
      data,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to fetch room booking history.",
      error: error.message,
    });
  }
});

router.patch("/update-room-features/:roomId", async (req, res) => {
  try {
    const { roomId } = req.params;
    const { room_features } = req.body.body || req.body;

    if (!room_features) {
      return res.status(400).json({
        status: "error",
        message: "room_features is required.",
      });
    }

    const { data, error } = await supabase
      .from("rooms")
      .update({ room_features })
      .eq("id", roomId)
      .select(`*, building:buildings(name, location)`);

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Room not found.",
      });
    }

    const processedData = {
      ...data[0],
      building_name: data[0].building?.name || null,
      building_location: data[0].building?.location || null,
    };

    res.status(200).json({
      status: "success",
      message: "Room features updated successfully.",
      data: processedData,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to update room features.",
      error: error.message,
    });
  }
});

module.exports = router;
