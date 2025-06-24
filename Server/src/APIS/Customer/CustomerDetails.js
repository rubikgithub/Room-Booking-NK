const express = require("express");

const supabase = require("../../../config/supabaseClient");
const router = express.Router();

const DEPARTMENTS = {
  MATH: "Math",
  MUSIC: "Music",
  SCIENCE: "Science",
  CULTURAL: "Cultural",
};


router.post("/users", async (req, res) => {
  try {
    const { department, role, status, page = 1, limit = 50 } = req.query;

    let query = supabase
      .from("users")
      .select(
        "id, first_name, last_name, email, clerk_id, role, department, dob, address, phone_number, status, created_at",
        { count: "exact" }
      );

    // Apply filters
    if (department) {
      query = query.eq("department", department);
    }
    if (role) {
      query = query.eq("role", role);
    }
    if (status) {
      query = query.eq("status", status);
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    // Order by created_at
    query = query.order("created_at", { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to fetch users: ${error.message}`);
    }

    res.json({
      status: "success",
      message: "Users fetched successfully",
      data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to retrieve users",
      error: error.message,
    });
  }
});

/**
 * Get available departments
 */
router.post("/getDepartments", async (req, res) => {
  try {
    const departments = Object.values(DEPARTMENTS);
    res.json({
      status: "success",
      message: "Departments fetched successfully",
      data: departments,
    });
  } catch (error) {
    console.error("Get departments error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to retrieve departments",
    });
  }
});


router.post('/getUser/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { data, error } = await supabase.from("users").select("*").eq("clerk_id", userId).single();
    res.status(200).json({
      status: "success",
      message: "User fetched successfully.",
      data,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch users", error: error.message });
  }
})

router.post('/getUser/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { data, error } = await supabase.from("users").select("*").eq("clerk_id", userId).single();
    res.status(200).json({
      status: "success",
      message: "User fetched successfully.",
      data,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch users", error: error.message });
  }
})

router.post('/getUserByEmail/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    const { data, error } = await supabase.from("users").select("*").eq("email", identifier).single();
    res.status(200).json({
      status: "success",
      message: "User fetched successfully.",
      data,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch users", error: error.message });
  }
})

module.exports = router;
