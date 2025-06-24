const express = require("express");
const supabase = require("../../../config/supabaseClient");
const router = express.Router();


router.post("/dashboard", async (req, res) => {
    try {
        const [
            departmentStats,
            topRooms,
            monthlyBookings,
            keyMetrics,
            utilizationRate
        ] = await Promise.all([
            getDepartmentStats(),
            getTopRoomsLastWeek(),
            getMonthlyBookingVolume(),
            getKeyMetrics(),
            getRoomUtilization()
        ]);

        res.status(200).json({
            status: "success",
            message: "Dashboard data fetched successfully.",
            data: {
                charts: {
                    departmentStats,
                    topRooms,
                    monthlyBookings
                },
                metrics: keyMetrics,
                insights: {
                    utilizationRate
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: "Failed to fetch dashboard data.",
            error: error.message || error
        });
    }
});

// ========================================
// CHART DATA ENDPOINTS
// ========================================

// 1. Department-wise booking percentage (Pie Chart)
router.get("/dashboard/department-stats", async (req, res) => {
    try {
        const data = await getDepartmentStats();
        res.status(200).json({
            status: "success",
            message: "Department statistics fetched successfully.",
            data
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: "Failed to fetch department statistics.",
            error: error.message || error
        });
    }
});

// 2. Top 5 most booked rooms - last week (Bar Graph)
router.get("/dashboard/top-rooms", async (req, res) => {
    try {
        const data = await getTopRoomsLastWeek();
        res.status(200).json({
            status: "success",
            message: "Top rooms data fetched successfully.",
            data
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: "Failed to fetch top rooms data.",
            error: error.message || error
        });
    }
});

// 3. Monthly booking volume (Line Chart)
router.get("/dashboard/monthly-volume", async (req, res) => {
    try {
        const { year } = req.query;
        const currentYear = year || new Date().getFullYear();
        
        const data = await getMonthlyBookingVolume(currentYear);
        res.status(200).json({
            status: "success",
            message: "Monthly booking volume fetched successfully.",
            data
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: "Failed to fetch monthly booking volume.",
            error: error.message || error
        });
    }
});

// 4. Year on year comparison
router.get("/dashboard/year-comparison", async (req, res) => {
    try {
        const data = await getYearOnYearComparison();
        res.status(200).json({
            status: "success",
            message: "Year comparison data fetched successfully.",
            data
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: "Failed to fetch year comparison data.",
            error: error.message || error
        });
    }
});

// ========================================
// KEY METRICS ENDPOINTS
// ========================================

// 5. All key metrics in one call
router.get("/dashboard/metrics", async (req, res) => {
    try {
        const data = await getKeyMetrics();
        res.status(200).json({
            status: "success",
            message: "Dashboard metrics fetched successfully.",
            data
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: "Failed to fetch dashboard metrics.",
            error: error.message || error
        });
    }
});

// 6. Active bookings with details
router.get("/dashboard/active-bookings", async (req, res) => {
    try {
        const data = await getActiveBookingsDetails();
        res.status(200).json({
            status: "success",
            message: "Active bookings fetched successfully.",
            data
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: "Failed to fetch active bookings.",
            error: error.message || error
        });
    }
});

// 7. Pending requests with details
router.get("/dashboard/pending-requests", async (req, res) => {
    try {
        const data = await getPendingRequestsDetails();
        res.status(200).json({
            status: "success",
            message: "Pending requests fetched successfully.",
            data
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: "Failed to fetch pending requests.",
            error: error.message || error
        });
    }
});

// 8. Available rooms with details
router.get("/dashboard/available-rooms", async (req, res) => {
    try {
        const data = await getAvailableRoomsDetails();
        res.status(200).json({
            status: "success",
            message: "Available rooms fetched successfully.",
            data
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: "Failed to fetch available rooms.",
            error: error.message || error
        });
    }
});

// ========================================
// ADMIN ACTIONS
// ========================================

// 9. Update booking status
router.patch("/dashboard/booking/:id/status", async (req, res) => {
    try {
        const { id } = req.params;
        const { status, adminClerkId } = req.body;

        // Get admin user ID from clerk ID
        const { data: adminUser, error: adminError } = await supabase
            .from("users")
            .select("id")
            .eq("clerk_id", adminClerkId)
            .single();

        if (adminError) throw adminError;

        // Update booking status
        const { data, error } = await supabase
            .from("bookings")
            .update({
                status: status,
                updated_by: adminUser.id,
                updated_at: new Date().toISOString()
            })
            .eq("id", id)
            .select(`
                *,
                user:users!fk_user_id (clerk_id, first_name, last_name),
                updatedBy:users!fk_updated_by_user (clerk_id, first_name, last_name),
                rooms (name, buildings (name))
            `);

        if (error) throw error;

        res.status(200).json({
            status: "success",
            message: "Booking status updated successfully.",
            data: data[0]
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: "Failed to update booking status.",
            error: error.message || error
        });
    }
});

async function getDepartmentStats() {
    const { data, error } = await supabase.rpc('get_department_booking_stats');
    
    if (error) {
        // Fallback to regular query if RPC function doesn't exist
        const { data: bookingsData, error: fallbackError } = await supabase
            .from("bookings")
            .select(`
                user:users!fk_user_id (department)
            `)
            .in("status", ["Booked", "Completed"]);

        if (fallbackError) throw fallbackError;

        // Process data manually
        const departmentCount = {};
        const totalBookings = bookingsData.length;

        bookingsData.forEach(booking => {
            const dept = booking.user?.department;
            if (dept) {
                departmentCount[dept] = (departmentCount[dept] || 0) + 1;
            }
        });

        return Object.entries(departmentCount).map(([department, booking_count]) => ({
            department,
            booking_count,
            percentage: ((booking_count / totalBookings) * 100).toFixed(2)
        }));
    }
    
    return data;
}

// Top rooms last week helper
async function getTopRoomsLastWeek() {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const today = new Date();

    const { data, error } = await supabase
        .from("bookings")
        .select(`
            room_id,
            rooms (name, capacity, buildings (name))
        `)
        .gte("date", oneWeekAgo.toISOString().split('T')[0])
        .lt("date", today.toISOString().split('T')[0])
        .in("status", ["Booked", "Completed"]);

    if (error) throw error;

    // Count bookings by room
    const roomCounts = {};
    data.forEach(booking => {
        const roomId = booking.room_id;
        const roomName = booking.rooms?.name;
        const capacity = booking.rooms?.capacity;
        const buildingName = booking.rooms?.buildings?.name;

        if (!roomCounts[roomId]) {
            roomCounts[roomId] = {
                room_name: roomName,
                capacity: capacity,
                building_name: buildingName,
                booking_count: 0
            };
        }
        roomCounts[roomId].booking_count++;
    });

    // Sort and return top 5
    return Object.values(roomCounts)
        .sort((a, b) => b.booking_count - a.booking_count)
        .slice(0, 5);
}

// Monthly booking volume helper
async function getMonthlyBookingVolume(year = new Date().getFullYear()) {
    const { data, error } = await supabase
        .from("bookings")
        .select("date")
        .gte("date", `${year}-01-01`)
        .lte("date", `${year}-12-31`)
        .in("status", ["Booked", "Completed"]);

    if (error) throw error;

    // Group by month
    const monthCounts = {};
    data.forEach(booking => {
        const month = new Date(booking.date).getMonth() + 1;
        monthCounts[month] = (monthCounts[month] || 0) + 1;
    });

    // Create array for all 12 months
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    return monthNames.map((month_name, index) => ({
        month_number: index + 1,
        month_name,
        year,
        booking_count: monthCounts[index + 1] || 0
    }));
}

// Year on year comparison helper
async function getYearOnYearComparison() {
    const currentYear = new Date().getFullYear();
    const previousYear = currentYear - 1;

    const [currentYearData, previousYearData] = await Promise.all([
        getMonthlyBookingVolume(currentYear),
        getMonthlyBookingVolume(previousYear)
    ]);

    // Merge data
    const comparison = currentYearData.map(current => {
        const previous = previousYearData.find(p => p.month_number === current.month_number);
        return {
            month_number: current.month_number,
            month_name: current.month_name,
            [`year_${currentYear}`]: current.booking_count,
            [`year_${previousYear}`]: previous ? previous.booking_count : 0
        };
    });

    return comparison;
}

// Key metrics helper
async function getKeyMetrics() {
    const today = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toTimeString().slice(0, 8);
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const [
        totalBookingsToday,
        activeBookingsNow,
        availableRooms,
        pendingRequests,
        cancelledToday,
        cancelledWeek
    ] = await Promise.all([
        // Total bookings today
        supabase
            .from("bookings")
            .select("id", { count: 'exact' })
            .eq("date", today),

        // Active bookings now
        supabase
            .from("bookings")
            .select("id", { count: 'exact' })
            .eq("date", today)
            .eq("status", "Booked")
            .lte("start_time", currentTime)
            .gte("end_time", currentTime),

        // Available rooms count
        supabase
            .from("rooms")
            .select("id", { count: 'exact' })
            .eq("status", "Active"),

        // Pending requests
        supabase
            .from("bookings")
            .select("id", { count: 'exact' })
            .eq("status", "Pending"),

        // Cancelled/Rejected today
        supabase
            .from("bookings")
            .select("id", { count: 'exact' })
            .in("status", ["Cancelled", "Rejected"])
            .gte("created_at", `${today}T00:00:00`)
            .lt("created_at", `${today}T23:59:59`),

        // Cancelled/Rejected this week
        supabase
            .from("bookings")
            .select("id", { count: 'exact' })
            .in("status", ["Cancelled", "Rejected"])
            .gte("created_at", oneWeekAgo.toISOString())
    ]);

    // Calculate available rooms (subtract currently booked rooms)
    const { data: bookedRooms } = await supabase
        .from("bookings")
        .select("room_id")
        .eq("date", today)
        .eq("status", "Booked")
        .lte("start_time", currentTime)
        .gte("end_time", currentTime);

    const totalRooms = availableRooms.count || 0;
    const currentlyBookedRooms = new Set(bookedRooms?.map(b => b.room_id) || []).size;
    const availableRoomsCount = totalRooms - currentlyBookedRooms;

    return {
        total_bookings_today: totalBookingsToday.count || 0,
        active_bookings_now: activeBookingsNow.count || 0,
        available_rooms_count: availableRoomsCount,
        pending_requests: pendingRequests.count || 0,
        cancelled_rejected_today: cancelledToday.count || 0,
        cancelled_rejected_week: cancelledWeek.count || 0
    };
}

// Active bookings details helper
async function getActiveBookingsDetails() {
    const today = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toTimeString().slice(0, 8);

    const { data, error } = await supabase
        .from("bookings")
        .select(`
            id,
            title,
            description,
            start_time,
            end_time,
            user:users!fk_user_id (first_name, last_name),
            rooms (name, buildings (name))
        `)
        .eq("date", today)
        .eq("status", "Booked")
        .lte("start_time", currentTime)
        .gte("end_time", currentTime)
        .order("start_time");

    if (error) throw error;

    return data.map(booking => ({
        booking_id: booking.id,
        room_name: booking.rooms?.name,
        building_name: booking.rooms?.buildings?.name,
        user_name: `${booking.user?.first_name} ${booking.user?.last_name}`,
        title: booking.title,
        start_time: booking.start_time,
        end_time: booking.end_time,
        description: booking.description
    }));
}

// Pending requests details helper
async function getPendingRequestsDetails() {
    const { data, error } = await supabase
        .from("bookings")
        .select(`
            id,
            date,
            start_time,
            end_time,
            title,
            description,
            created_at,
            user:users!fk_user_id (first_name, last_name, department),
            rooms (name, buildings (name))
        `)
        .eq("status", "Pending")
        .order("created_at", { ascending: false });

    if (error) throw error;

    return data.map(booking => ({
        booking_id: booking.id,
        room_name: booking.rooms?.name,
        building_name: booking.rooms?.buildings?.name,
        user_name: `${booking.user?.first_name} ${booking.user?.last_name}`,
        department: booking.user?.department,
        date: booking.date,
        start_time: booking.start_time,
        end_time: booking.end_time,
        title: booking.title,
        description: booking.description,
        created_at: booking.created_at
    }));
}

// Available rooms details helper
async function getAvailableRoomsDetails() {
    const today = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toTimeString().slice(0, 8);

    // Get all active rooms
    const { data: allRooms, error: roomsError } = await supabase
        .from("rooms")
        .select(`
            id,
            name,
            type,
            capacity,
            room_features,
            buildings (name)
        `)
        .eq("status", "Active");

    if (roomsError) throw roomsError;

    // Get currently booked rooms
    const { data: bookedRooms, error: bookedError } = await supabase
        .from("bookings")
        .select("room_id")
        .eq("date", today)
        .eq("status", "Booked")
        .lte("start_time", currentTime)
        .gte("end_time", currentTime);

    if (bookedError) throw bookedError;

    const bookedRoomIds = new Set(bookedRooms?.map(b => b.room_id) || []);

    // Filter out booked rooms
    const availableRooms = allRooms.filter(room => !bookedRoomIds.has(room.id));

    return availableRooms.map(room => ({
        room_id: room.id,
        room_name: room.name,
        type: room.type,
        capacity: room.capacity,
        building_name: room.buildings?.name,
        room_features: room.room_features
    }));
}

// Room utilization helper
async function getRoomUtilization(days = 30) {
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - days);

    const { data: rooms, error: roomsError } = await supabase
        .from("rooms")
        .select("id, name")
        .eq("status", "Active");

    if (roomsError) throw roomsError;

    const { data: bookings, error: bookingsError } = await supabase
        .from("bookings")
        .select("room_id, status")
        .gte("date", daysAgo.toISOString().split('T')[0]);

    if (bookingsError) throw bookingsError;

    // Calculate utilization for each room
    const utilizationData = rooms.map(room => {
        const roomBookings = bookings.filter(b => b.room_id === room.id);
        const totalBookings = roomBookings.length;
        const BookedBookings = roomBookings.filter(b => b.status === 'Booked').length;
        const utilizationRate = totalBookings > 0 ? ((BookedBookings / totalBookings) * 100).toFixed(2) : 0;

        return {
            room_name: room.name,
            total_bookings: totalBookings,
            Booked_bookings: BookedBookings,
            utilization_rate: parseFloat(utilizationRate)
        };
    });

    return utilizationData.sort((a, b) => b.utilization_rate - a.utilization_rate);
}

module.exports = router;