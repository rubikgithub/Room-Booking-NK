const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const clearkClientInstance = require("../../../config/clerkClient");
const supabase = require("../../../config/supabaseClient");

// Constants
const USER_ROLES = {
  USER: "user",
  ADMIN: "admin",
  MODERATOR: "moderator",
};

const ERROR_CODES = {
  USER_EXISTS: "USER_EXISTS",
  USER_NOT_FOUND: "USER_NOT_FOUND",
  CLERK_ERROR: "CLERK_ERROR",
  SUPABASE_ERROR: "SUPABASE_ERROR",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  PWNED_PASSWORD: "PWNED_PASSWORD",
};

// Utility Functions
const validateUserData = (userData, isUpdate = false) => {
  const errors = [];

  if (!isUpdate && !userData.email) {
    errors.push("Email is required");
  }

  if (userData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
    errors.push("Invalid email format");
  }

  if (!isUpdate && !userData.password) {
    errors.push("Password is required");
  }

  if (userData.password && userData.password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  if (!isUpdate && !userData.first_name?.trim()) {
    errors.push("First name is required");
  }

  if (!isUpdate && !userData.last_name?.trim()) {
    errors.push("Last name is required");
  }

  return errors;
};

const sanitizeUserData = (userData) => {
  return {
    first_name: userData.first_name?.trim(),
    last_name: userData.last_name?.trim(),
    email: userData.email?.toLowerCase().trim(),
    address: userData.address?.trim(),
    phone_number: userData.phone_number?.trim(),
    dob: userData.dob,
    role: userData.role || USER_ROLES.USER,
  };
};

const createSupabaseUser = async (userData) => {
  try {
    const userId = uuidv4();
    const sanitizedData = sanitizeUserData(userData);

    const user = {
      id: userId,
      ...sanitizedData,
    };

    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("id, email")
      .eq("email", user.email)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      throw new Error(`Database check failed: ${checkError.message}`);
    }

    if (existingUser) {
      return {
        success: false,
        code: ERROR_CODES.USER_EXISTS,
        message: "User with this email already exists",
      };
    }

    // Insert new user
    const { data, error } = await supabase
      .from("users")
      .insert([user])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create user in database: ${error.message}`);
    }

    return {
      success: true,
      data,
      message: "User created successfully in database",
    };
  } catch (error) {
    console.error("Supabase user creation error:", error);
    return {
      success: false,
      code: ERROR_CODES.SUPABASE_ERROR,
      message: error.message || "Database operation failed",
      error,
    };
  }
};

const createClerkUser = async (userData, supabaseUserId) => {
  try {
    const clerk = clearkClientInstance();
    const uuid = uuidv4().substring(0, 8);

    const clerkUserData = {
      external_id: supabaseUserId,
      first_name: userData.first_name,
      last_name: userData.last_name,
      email_address: [userData.email],
      username: `${userData.first_name.toLowerCase()}${uuid}`,
      password: userData.password,
      delete_self_enabled: true,
      create_organization_enabled: false,
      create_organizations_limit: 0,
    };

    const clerkUser = await clerk.users.createUser(clerkUserData);

    return {
      success: true,
      data: clerkUser,
      message: "User created successfully in Clerk",
    };
  } catch (error) {
    console.error("Clerk user creation error:", error);
    return {
      success: false,
      code: ERROR_CODES.CLERK_ERROR,
      message: error.message || "Authentication service error",
      error,
    };
  }
};

const updateSupabaseWithClerkId = async (supabaseUserId, clerkUserId) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .update({ clerk_id: clerkUserId })
      .eq("id", supabaseUserId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update user with Clerk ID: ${error.message}`);
    }

    return { success: true, data };
  } catch (error) {
    console.error("Failed to update Supabase with Clerk ID:", error);
    throw error;
  }
};

const rollbackSupabaseUser = async (userId) => {
  try {
    if (userId) {
      await supabase.from("users").delete().eq("id", userId);
      console.log(`Rolled back Supabase user: ${userId}`);
    }
  } catch (error) {
    console.error("Rollback failed:", error);
  }
};

const rollbackClerkUser = async (clerkUserId) => {
  try {
    if (clerkUserId) {
      const clerk = clearkClientInstance();
      await clerk.users.deleteUser(clerkUserId);
      console.log(`Rolled back Clerk user: ${clerkUserId}`);
    }
  } catch (error) {
    console.error("Clerk rollback failed:", error);
  }
};

// Routes

/**
 * Create a new user in both Supabase and Clerk
 */
router.post("/createUser", async (req, res) => {
  let supabaseUserId = null;
  let clerkUserId = null;

  try {
    const userData = req.body.body || req.body;

    // Validate input data
    const validationErrors = validateUserData(userData);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        status: "error",
        code: ERROR_CODES.VALIDATION_ERROR,
        message: "Validation failed",
        errors: validationErrors,
      });
    }

    // Step 1: Create user in Supabase
    const supabaseResult = await createSupabaseUser(userData);
    if (!supabaseResult.success) {
      return res
        .status(supabaseResult.code === ERROR_CODES.USER_EXISTS ? 409 : 500)
        .json({
          status: "error",
          code: supabaseResult.code,
          message: supabaseResult.message,
        });
    }

    supabaseUserId = supabaseResult.data.id;

    // Step 2: Create user in Clerk
    const clerkResult = await createClerkUser(userData, supabaseUserId);
    if (!clerkResult.success) {
      await rollbackSupabaseUser(supabaseUserId);

      // Check for pwned password error
      if (clerkResult.error?.errors?.[0]?.code === "form_password_pwned") {
        return res.status(422).json({
          status: "error",
          code: ERROR_CODES.PWNED_PASSWORD,
          message:
            "This password has been found in a data breach. Please choose a different password.",
        });
      }

      return res.status(500).json({
        status: "error",
        code: clerkResult.code,
        message: clerkResult.message,
      });
    }

    clerkUserId = clerkResult.data.id;

    // Step 3: Update Supabase with Clerk ID
    await updateSupabaseWithClerkId(supabaseUserId, clerkUserId);

    // Success response
    res.status(201).json({
      status: "success",
      message: "User created successfully",
      data: {
        id: supabaseUserId,
        clerk_id: clerkUserId,
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
      },
    });
  } catch (error) {
    console.error("User creation failed:", error);

    // Rollback operations
    await rollbackSupabaseUser(supabaseUserId);
    await rollbackClerkUser(clerkUserId);

    res.status(500).json({
      status: "error",
      message: "User creation failed due to unexpected error",
      error: error.message,
    });
  }
});

/**
 * Update user in both Supabase and Clerk
 */
router.post("/updateUser/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedUserData = req.body.body || req.body;

    if (!id) {
      return res.status(400).json({
        status: "error",
        code: ERROR_CODES.VALIDATION_ERROR,
        message: "User ID is required",
      });
    }

    // Validate update data
    const validationErrors = validateUserData(updatedUserData, true);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        status: "error",
        code: ERROR_CODES.VALIDATION_ERROR,
        message: "Validation failed",
        errors: validationErrors,
      });
    }

    // Fetch current user data
    const { data: existingUser, error: fetchError } = await supabase
      .from("users")
      .select("clerk_id, email, first_name, last_name")
      .eq("id", id)
      .single();

    if (fetchError || !existingUser) {
      return res.status(404).json({
        status: "error",
        code: ERROR_CODES.USER_NOT_FOUND,
        message: "User not found",
      });
    }

    const { clerk_id } = existingUser;

    // Update in Clerk if clerk_id exists
    if (clerk_id) {
      try {
        const clerk = clearkClientInstance();
        const clerkUpdateData = {};

        if (updatedUserData.first_name)
          clerkUpdateData.first_name = updatedUserData.first_name;
        if (updatedUserData.last_name)
          clerkUpdateData.last_name = updatedUserData.last_name;
        if (updatedUserData.email)
          clerkUpdateData.email_address = [updatedUserData.email];

        if (Object.keys(clerkUpdateData).length > 0) {
          await clerk.users.updateUser(clerk_id, clerkUpdateData);
        }
      } catch (clerkError) {
        console.error("Clerk update error:", clerkError);
        return res.status(500).json({
          status: "error",
          code: ERROR_CODES.CLERK_ERROR,
          message: "Failed to update user in authentication service",
        });
      }
    }

    // Update in Supabase
    const sanitizedData = sanitizeUserData(updatedUserData);
    const { data, error } = await supabase
      .from("users")
      .update(sanitizedData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update user in database: ${error.message}`);
    }

    res.json({
      status: "success",
      message: "User updated successfully",
      data,
    });
  } catch (error) {
    console.error("User update error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to update user",
    });
  }
});

/**
 * Delete user from both Supabase and Clerk
 */
router.post("/deleteUser/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        status: "error",
        message: "User ID is required",
      });
    }

    // Get user data including clerk_id
    const { data: userData, error: fetchError } = await supabase
      .from("users")
      .select("clerk_id")
      .eq("id", id)
      .single();

    if (fetchError || !userData) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    // Delete from Clerk if clerk_id exists
    if (userData.clerk_id) {
      try {
        const clerk = clearkClientInstance();
        await clerk.users.deleteUser(userData.clerk_id);
      } catch (clerkError) {
        console.error("Clerk deletion error:", clerkError);
      }
    }

    // Delete from Supabase
    const { error: deleteError } = await supabase
      .from("users")
      .delete()
      .eq("id", id);

    if (deleteError) {
      throw new Error(`Failed to delete user: ${deleteError.message}`);
    }

    res.json({
      status: "success",
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("User deletion error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to delete user",
    });
  }
});

/**
 * Get user by email
 */
router.post("/getUserByEmail/:email", async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({
        status: "error",
        message: "Email is required",
      });
    }

    const { data, error } = await supabase
      .from("users")
      .select("id, first_name, last_name, email, clerk_id, role")
      .eq("email", email.toLowerCase())
      .single();

    if (error || !data) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    res.json({
      status: "success",
      data,
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to retrieve user",
    });
  }
});

/**
 * Revoke user session
 */
router.post("/revokeSession/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({
        status: "error",
        message: "Session ID is required",
      });
    }

    const clerk = clearkClientInstance();
    await clerk.sessions.revokeSession(sessionId);

    res.json({
      status: "success",
      message: "Session revoked successfully",
    });
  } catch (error) {
    console.error("Session revocation error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to revoke session",
    });
  }
});

module.exports = router;
