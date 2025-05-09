const express = require("express");
const supabase = require("../../../config/supabaseClient");
const router = express.Router();

router.post("/allBookings", async (req, res) => {
    try {
        const { buildingIds } = req.query;

        let query = supabase.from("bookings").select(`
            *,
            user:users!fk_user_id (clerk_id, first_name, last_name),
            updatedBy:users!fk_updated_by_user (clerk_id, first_name, last_name),
            rooms (name,buildings (name), building_id)
          `);

        if (buildingIds && buildingIds.length > 0) {
            query = query.in("rooms.building_id", buildingIds);
        }

        const { data, error } = await query;



        res.status(200).json({
            status: "success",
            message: "Bookings fetched successfully.",
            data,
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: "Failed to fetch bookings.",
            error: error.message || error,
        });
    }
});
router.post("/myBookings/:clerkId", async (req, res) => {
    const { clerkId } = req.params;

    try {
        const { data: existingUser, error: checkError } = await supabase
            .from("users")
            .select("*")
            .eq("clerk_id", clerkId)
            .single();

        // if (checkError) throw checkError;

        const { data, error } = await supabase
            .from("bookings")
            .select(
                ` 
            *,
            user:users!fk_user_id (clerk_id, first_name, last_name),
            updatedBy:users!fk_updated_by_user (clerk_id, first_name, last_name),
            rooms (name, buildings (name)) 
          `
            )
            .eq("user_id", existingUser?.id);



        res.status(200).json({
            status: 'success',
            message: data?.length
                ? "Bookings fetched successfully for user."
                : "No bookings found for the user.",
            data,
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({
            status: 'error',
            message: "Failed to fetch bookings by user.",
            error: error.message || error,
        });
    }
})





module.exports = router;