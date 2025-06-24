const express = require("express");
const supabase = require("../../../config/supabaseClient");
const router = express.Router();

const timeToMinutes = (timeStr) => {
  if (!timeStr || typeof timeStr !== "string") {
    throw new Error(`Invalid time format: ${timeStr}`);
  }

  const cleanTime = timeStr.trim();

  if (cleanTime.includes(":") && !cleanTime.includes(" ")) {
    const parts = cleanTime.split(":");
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);

    if (isNaN(hours) || isNaN(minutes)) {
      throw new Error(`Invalid 24-hour time format: ${timeStr}`);
    }

    return hours * 60 + minutes;
  }

  const parts = cleanTime.split(" ");
  if (parts.length !== 2) {
    throw new Error(
      `Invalid time format: ${timeStr}. Expected format: "4:00 AM" or "04:00:00"`
    );
  }

  const [time, period] = parts;
  const timeParts = time.split(":");

  if (timeParts.length < 2) {
    throw new Error(
      `Invalid time format: ${timeStr}. Expected format: "4:00 AM"`
    );
  }

  let hours = parseInt(timeParts[0], 10);
  const minutes = parseInt(timeParts[1], 10);

  if (isNaN(hours) || isNaN(minutes)) {
    throw new Error(
      `Invalid time format: ${timeStr}. Hours and minutes must be numbers.`
    );
  }

  const normalizedPeriod = period.toUpperCase();

  if (normalizedPeriod === "PM" && hours !== 12) {
    hours += 12;
  } else if (normalizedPeriod === "AM" && hours === 12) {
    hours = 0;
  } else if (normalizedPeriod !== "AM" && normalizedPeriod !== "PM") {
    throw new Error(`Invalid time period: ${period}. Expected AM or PM.`);
  }

  return hours * 60 + minutes;
};

router.post("/createBooking", async (req, res) => {
  const booking = req.body.body || req.body;
  const { user_id, room_id, date, start_time, end_time } = booking;

  try {
    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("*")
      .eq("id", user_id)
      .maybeSingle();

    if (checkError) throw checkError;

    if (!existingUser || !existingUser.clerk_id) {
      return res.status(400).json({
        status: "fail",
        message: "User not found.",
      });
    }

    if (!user_id || !room_id || !date || !start_time || !end_time) {
      return res.status(400).json({
        status: "fail",
        message:
          "Missing required fields: user_id, room_id, date, start_time, end_time",
      });
    }

    try {
      const newStartMinutes = timeToMinutes(start_time);
      const newEndMinutes = timeToMinutes(end_time);

      if (newStartMinutes >= newEndMinutes) {
        return res.status(400).json({
          status: "fail",
          message: "Start time must be before end time.",
        });
      }
    } catch (timeError) {
      return res.status(400).json({
        status: "fail",
        message: `Invalid time format: ${timeError.message}`,
      });
    }

    const { data: existingBookings, error: bookingCheckError } = await supabase
      .from("bookings")
      .select("start_time, end_time, title, room_id, user_id")
      .eq("date", date)
      .in("status", ["Pending", "Completed", "Booked"]);

    if (bookingCheckError) {
      throw bookingCheckError;
    }

    const conflictingBookings = [];

    for (const existingBooking of existingBookings) {
      try {
        const existingStartMinutes = timeToMinutes(existingBooking.start_time);
        const existingEndMinutes = timeToMinutes(existingBooking.end_time);
        const newStartMinutes = timeToMinutes(start_time);
        const newEndMinutes = timeToMinutes(end_time);

        const hasOverlap =
          newStartMinutes < existingEndMinutes &&
          existingStartMinutes < newEndMinutes;

        if (hasOverlap) {
          console.log("CONFLICT FOUND with booking:", existingBooking.title);
          conflictingBookings.push({
            title: existingBooking.title,
            room_id: existingBooking.room_id,
            user_id: existingBooking.user_id,
            time: `${existingBooking.start_time} - ${existingBooking.end_time}`,
          });
        }
      } catch (error) {
        console.log(
          `Error parsing existing booking time: ${error.message}`,
          existingBooking
        );
      }
    }

    if (conflictingBookings.length > 0) {
      return res.status(201).json({
        status: "success",
        message: `Cannot create booking. There are conflicting bookings during ${start_time} - ${end_time} on ${date}.`,
        conflictingBookings,
        requestedTime: `${start_time} - ${end_time}`,
        totalConflicts: conflictingBookings.length,
      });
    }
    const { data, error } = await supabase.from("bookings").insert(booking);
    if (error) throw error;
    res.status(201).json({
      status: "success",
      message: "Booking created successfully.",
      data,
    });
  } catch (error) {
    console.log(error, "Error creating booking");
    res.status(500).json({
      status: "fail",
      message: "Failed to create booking.",
      error: error.message || error,
    });
  }
});

router.post("/deleteBooking", async (req, res) => {
  try {
    const { bookingId, userId } = req.body.body || req.body;

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", userId)
      .single();

    if (userError) {
      return res.status(500).json({
        status: "fail",
        message: "Error fetching user role.",
        error: userError.message || userError,
      });
    }

    const isAdmin = userData.role === "admin";

    const { data: bookingData, error: bookingError } = await supabase
      .from("bookings")
      .select("user_id")
      .eq("id", bookingId)
      .single();

    if (bookingError) {
      return res.status(404).json({
        status: "fail",
        message: "Booking not found.",
        error: bookingError.message || bookingError,
      });
    }

    if (bookingData.user_id !== userId && !isAdmin) {
      return res.status(403).json({
        status: "fail",
        message: "Only the owner of the booking or an admin can delete it.",
      });
    }

    const { error: deleteError } = await supabase
      .from("bookings")
      .delete()
      .eq("id", bookingId);

    if (deleteError) {
      return res.status(500).json({
        status: "fail",
        message: "Failed to delete booking.",
        error: deleteError.message || deleteError,
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Booking deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: "An error occurred while deleting the booking.",
      error: error.message || error,
    });
  }
});

router.post("/check-room-availability", async (req, res) => {
  const { roomId, date, startTime, endTime } = req.body.body || req.body;

  try {
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("room_id", roomId)
      .eq("date", date)
      .or(`and(start_time.lte.${endTime},end_time.gte.${startTime})`);

    if (error) throw error;

    res.status(200).json({
      status: "success",
      message:
        data.length === 0 ? "Room is available." : "Room is not available.",
      data: { isAvailable: data.length === 0 },
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: "Error checking room availability.",
      error: error.message || error,
    });
  }
});

router.post("/update-booking", async (req, res) => {
  try {
    const { bookingId, updates, userId } = req.body.body || req.body;

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", userId)
      .single();

    if (userError) {
      return res.status(500).json({
        status: "fail",
        message: "Error fetching user role.",
        error: userError.message || userError,
      });
    }

    const isAdmin = userData.role === "admin";

    const { data: bookingData, error: bookingError } = await supabase
      .from("bookings")
      .select("user_id")
      .eq("id", bookingId)
      .single();

    if (bookingError) {
      return res.status(404).json({
        status: "fail",
        message: "Booking not found.",
        error: bookingError.message || bookingError,
      });
    }

    if (bookingData.user_id !== userId && !isAdmin) {
      return res.status(403).json({
        status: "fail",
        message:
          "Only the user who owns the booking or an admin can update it.",
      });
    }

    const { error } = await supabase
      .from("bookings")
      .update({
        ...updates,
        updated_by: userId,
      })
      .eq("id", bookingId);

    if (error) {
      return res.status(500).json({
        status: "fail",
        message: "Failed to update booking.",
        error: error.message || error,
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Booking updated successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: "An error occurred while updating the booking.",
      error: error.message || error,
    });
  }
});

module.exports = router;
