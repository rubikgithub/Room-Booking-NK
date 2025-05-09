const express = require("express");
const supabase = require("../../../config/supabaseClient");
const router = express.Router();

router.post("/createBooking", async (req, res) => {
  const booking = req.body.body || req.body;
  const { user_id } = booking;
  try {
    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("*")
      .eq("id", user_id)
      .single();

    if (checkError) throw checkError;

    if (!existingUser && existingUser?.clerk_id) {
      return res.status(400).json({
        status: "fail",
        message: "User not found.",
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
