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

const DEPARTMENTS = {
  MATH: "Math",
  MUSIC: "Music",
  SCIENCE: "Science",
  CULTURAL: "Cultural",
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

  // Validate department if provided
  if (userData.department && userData.department.trim()) {
    const validDepartments = Object.values(DEPARTMENTS);
    if (!validDepartments.includes(userData.department.trim())) {
      errors.push(`Department must be one of: ${validDepartments.join(", ")}`);
    }
  }

  // Validate role if provided
  if (userData.role && !Object.values(USER_ROLES).includes(userData.role)) {
    errors.push(`Role must be one of: ${Object.values(USER_ROLES).join(", ")}`);
  }

  return errors;
};

const sanitizeUserData = (userData) => {
  const sanitized = {
    first_name: userData.first_name?.trim(),
    last_name: userData.last_name?.trim(),
    email: userData.email?.toLowerCase().trim(),
    address: userData.address?.trim(),
    phone_number: userData.phone_number?.trim(),
    dob: userData.dob,
    role: userData.role || USER_ROLES.USER,
    department: userData.department?.trim() || null, // Add department field
  };

  // Remove undefined values to avoid updating with undefined
  Object.keys(sanitized).forEach((key) => {
    if (sanitized[key] === undefined) {
      delete sanitized[key];
    }
  });

  return sanitized;
};

const createSupabaseUser = async (userData) => {
  try {
    const userId = uuidv4();
    const sanitizedData = sanitizeUserData(userData);

    const user = {
      id: userId,
      ...sanitizedData,
      status:"Inactive",
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
        department: userData.department,
        role: userData.role || USER_ROLES.USER,
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

// Enhanced validation function
const validateUserUpdateData = (userData, isPasswordUpdate = false) => {
  const errors = [];

  // Email validation
  if (userData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
    errors.push("Invalid email format");
  }

  // Password validation (if provided)
  if (userData.password || isPasswordUpdate) {
    if (!userData.password) {
      errors.push("Password is required for password update");
    } else if (userData.password.length < 8) {
      errors.push("Password must be at least 8 characters long");
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(userData.password)) {
      errors.push("Password must contain at least one uppercase letter, one lowercase letter, and one number");
    }

    // Confirm password validation
    if (userData.confirmPassword && userData.password !== userData.confirmPassword) {
      errors.push("Password and confirm password do not match");
    }
  }
  return errors;
};

// Enhanced sanitize function
const sanitizeUserUpdateData = (userData) => {
  const sanitized = {};
  
  // Only include fields that are explicitly provided and not empty
  if (userData.first_name?.trim()) {
    sanitized.first_name = userData.first_name.trim();
  }
  
  if (userData.last_name?.trim()) {
    sanitized.last_name = userData.last_name.trim();
  }
  
  if (userData.email?.trim()) {
    sanitized.email = userData.email.toLowerCase().trim();
  }
  
  if (userData.address?.trim()) {
    sanitized.address = userData.address.trim();
  }
  
  if (userData.phone_number?.trim()) {
    sanitized.phone_number = userData.phone_number.trim();
  }
  
  if (userData.dob) {
    sanitized.dob = userData.dob;
  }
  
  if (userData.department?.trim()) {
    sanitized.department = userData.department.trim();
  }
  
  if (userData.role) {
    sanitized.role = userData.role;
  }

  return sanitized;
};

// Check if email is already in use by another user
const checkEmailAvailability = async (email, currentUserId) => {
  const { data, error } = await supabase
    .from("users")
    .select("id, email")
    .eq("email", email.toLowerCase())
    .neq("id", currentUserId);

  if (error) throw error;
  return data.length === 0;
};

// Update user password in Clerk
const updatePasswordInClerk = async (clerkId, newPassword) => {
  try {
    const clerk = clearkClientInstance();
    await clerk.users.updateUser(clerkId, {
      password: newPassword
    });
    return { success: true };
  } catch (error) {
    console.error("Clerk password update error:", error);
    
    // Handle specific Clerk errors
    if (error.errors?.[0]?.code === "form_password_pwned") {
      return {
        success: false,
        code: "PWNED_PASSWORD",
        message: "This password has been found in a data breach. Please choose a different password."
      };
    }
    
    return {
      success: false,
      code: "CLERK_ERROR",
      message: error.message || "Failed to update password in authentication service"
    };
  }
};

router.post("/updateUser/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedUserData = req.body.body || req.body;

    console.log("Update user request:", {
      userId: id,
      fields: Object.keys(updatedUserData),
      hasPassword: !!updatedUserData.password,
      hasProfileData: !!(updatedUserData.first_name || updatedUserData.last_name || updatedUserData.email || updatedUserData.department)
    });

    if (!id) {
      return res.status(400).json({
        status: "error",
        code: "VALIDATION_ERROR",
        message: "User ID is required",
      });
    }

    const isPasswordUpdate = !!(updatedUserData.password);
    
    // Validate all update data
    const validationErrors = validateUserUpdateData(updatedUserData, isPasswordUpdate);
    
    if (validationErrors.length > 0) {
      return res.status(400).json({
        status: "error",
        code: "VALIDATION_ERROR",
        message: "Validation failed",
        errors: validationErrors,
      });
    }

    // Fetch current user data
    const { data: existingUser, error: fetchError } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !existingUser) {
      return res.status(404).json({
        status: "error",
        code: "USER_NOT_FOUND",
        message: "User not found",
      });
    }

    const { clerk_id } = existingUser;

    // Check email availability if email is being updated
    if (updatedUserData.email && updatedUserData.email !== existingUser.email) {
      const emailAvailable = await checkEmailAvailability(updatedUserData.email, id);
      if (!emailAvailable) {
        return res.status(409).json({
          status: "error",
          code: "EMAIL_EXISTS",
          message: "Email is already in use by another user",
        });
      }
    }

    // Track what was updated
    let passwordUpdated = false;
    let profileUpdated = false;
    let clerkUpdated = false;

    // Step 1: Update password in Clerk (if provided)
    if (isPasswordUpdate && clerk_id) {
      console.log("Updating password in Clerk for user:", id);
      
      const passwordResult = await updatePasswordInClerk(clerk_id, updatedUserData.password);
      console.log(" router.post ~ passwordResult:", passwordResult)
      
      if (!passwordResult.success) {
        return res.status(passwordResult.code === "PWNED_PASSWORD" ? 422 : 500).json({
          status: "error",
          code: passwordResult.code,
          message: passwordResult.message,
        });
      }
      
      passwordUpdated = true;
      console.log("Password updated successfully in Clerk");
    }

    // Step 2: Update profile data in Clerk (if any Clerk-managed fields are provided)
    if (clerk_id) {
      try {
        const clerk = clearkClientInstance();
        const clerkUpdateData = {};

        // Include password in Clerk update if provided
        if (updatedUserData.password) {
          clerkUpdateData.password = updatedUserData.password;
        }

        // Include profile fields that Clerk manages
        if (updatedUserData.first_name && updatedUserData.first_name !== existingUser.first_name) {
          clerkUpdateData.first_name = updatedUserData.first_name.trim();
        }
        
        if (updatedUserData.last_name && updatedUserData.last_name !== existingUser.last_name) {
          clerkUpdateData.last_name = updatedUserData.last_name.trim();
        }
        
        if (updatedUserData.email && updatedUserData.email !== existingUser.email) {
          clerkUpdateData.email_address = [updatedUserData.email.toLowerCase().trim()];
        }

        if (Object.keys(clerkUpdateData).length > 0) {
          console.log("Updating Clerk with profile and/or password data");
          const clerkResponse = await clerk.users.updateUser(clerk_id, clerkUpdateData);
          clerkUpdated = true;
          console.log("Clerk profile update successful");
        }
      } catch (clerkError) {
        console.error("Clerk profile update error:", clerkError);
        return res.status(500).json({
          status: "error",
          code: "CLERK_ERROR",
          message: "Failed to update user in authentication service",
          details: clerkError.message
        });
      }
    }

    // Step 3: Update profile data in Supabase
    const sanitizedData = sanitizeUserUpdateData(updatedUserData);
    
    // Check if there are actual profile changes
    const hasProfileChanges = Object.keys(sanitizedData).some(key => 
      sanitizedData[key] !== existingUser[key]
    );

    if (hasProfileChanges) {
      console.log("Updating Supabase with profile data:", sanitizedData);
      
      const { data, error } = await supabase
        .from("users")
        .update({
          ...sanitizedData
        })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        // If Supabase update fails but Clerk was updated, we should log this inconsistency
        console.error("Supabase update failed after Clerk update:", error);
        throw new Error(`Failed to update user profile in database: ${error.message}`);
      }

      profileUpdated = true;
      console.log("Supabase profile update successful");

      // Prepare response message
      const updateMessages = [];
      if (passwordUpdated) updateMessages.push("password");
      if (profileUpdated) updateMessages.push("profile");
      
      const message = updateMessages.length > 1 
        ? `User ${updateMessages.join(" and ")} updated successfully`
        : `User ${updateMessages[0]} updated successfully`;

      return res.json({
        status: "success",
        message: message,
        data: data,
        updates: {
          passwordUpdated,
          profileUpdated,
          clerkUpdated
        }
      });
    }

    // If no profile changes but password was updated
    if (passwordUpdated && !hasProfileChanges) {
      return res.json({
        status: "success",
        message: "Password updated successfully",
        data: {
          ...existingUser,
          updated_at: new Date().toISOString()
        },
        updates: {
          passwordUpdated: true,
          profileUpdated: false,
          clerkUpdated
        }
      });
    }

    // If no changes at all
    return res.json({
      status: "success",
      message: "No changes detected",
      data: existingUser,
      updates: {
        passwordUpdated: false,
        profileUpdated: false,
        clerkUpdated: false
      }
    });

  } catch (error) {
    console.error("User update error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to update user",
      error: error.message,
    });
  }
});

// Separate endpoint for password updates only
router.post("/updatePassword/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword, confirmPassword } = req.body.body || req.body;

    console.log("Password update request for user:", id);

    if (!id || !newPassword || !confirmPassword) {
      return res.status(400).json({
        status: "error",
        code: "VALIDATION_ERROR",
        message: "User ID, new password, and confirm password are required",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        status: "error",
        code: "VALIDATION_ERROR",
        message: "New password and confirm password do not match",
      });
    }

    // Validate password strength
    const validationErrors = validateUserUpdateData({ password: newPassword }, true);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        status: "error",
        code: "VALIDATION_ERROR",
        message: "Password validation failed",
        errors: validationErrors,
      });
    }

    // Fetch user
    const { data: existingUser, error: fetchError } = await supabase
      .from("users")
      .select("clerk_id, email")
      .eq("id", id)
      .single();

    if (fetchError || !existingUser) {
      return res.status(404).json({
        status: "error",
        code: "USER_NOT_FOUND",
        message: "User not found",
      });
    }

    if (!existingUser.clerk_id) {
      return res.status(400).json({
        status: "error",
        code: "NO_CLERK_ID",
        message: "User is not properly linked to authentication service",
      });
    }

    // Update password in Clerk
    const passwordResult = await updatePasswordInClerk(existingUser.clerk_id, newPassword);
    
    if (!passwordResult.success) {
      return res.status(passwordResult.code === "PWNED_PASSWORD" ? 422 : 500).json({
        status: "error",
        code: passwordResult.code,
        message: passwordResult.message,
      });
    }

    res.json({
      status: "success",
      message: "Password updated successfully",
      data: {
        id,
        email: existingUser.email,
        updated_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error("Password update error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to update password",
      error: error.message,
    });
  }
});

// Endpoint to check if email is available
router.post("/checkEmailAvailability", async (req, res) => {
  try {
    const { email, currentUserId } = req.body.body || req.body;

    if (!email) {
      return res.status(400).json({
        status: "error",
        message: "Email is required",
      });
    }

    const isAvailable = await checkEmailAvailability(email, currentUserId);

    res.json({
      status: "success",
      data: {
        email,
        isAvailable
      }
    });

  } catch (error) {
    console.error("Email availability check error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to check email availability",
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
      .select("clerk_id, email, first_name, last_name, department, role")
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

    // Update in Clerk if clerk_id exists (only for fields that Clerk manages)
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

    // Update in Supabase (including department and other fields)
    const sanitizedData = sanitizeUserData(updatedUserData);

    // Remove any fields that are undefined or null to avoid unnecessary updates
    const updateData = {};
    Object.keys(sanitizedData).forEach((key) => {
      if (sanitizedData[key] !== undefined && sanitizedData[key] !== null) {
        updateData[key] = sanitizedData[key];
      }
    });

    const { data, error } = await supabase
      .from("users")
      .update(updateData)
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
      error: error.message,
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
      .select(
        "id, first_name, last_name, email, clerk_id, role, department, dob, address, phone_number, status, created_at"
      )
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
 * Update user department only
 */
router.patch("/updateDepartment/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { department } = req.body;

    if (!id) {
      return res.status(400).json({
        status: "error",
        message: "User ID is required",
      });
    }

    if (!department) {
      return res.status(400).json({
        status: "error",
        message: "Department is required",
      });
    }

    // Validate department
    const validDepartments = Object.values(DEPARTMENTS);
    if (!validDepartments.includes(department)) {
      return res.status(400).json({
        status: "error",
        message: `Department must be one of: ${validDepartments.join(", ")}`,
      });
    }

    // Update department in Supabase
    const { data, error } = await supabase
      .from("users")
      .update({ department: department })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update department: ${error.message}`);
    }

    if (!data) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    res.json({
      status: "success",
      message: "Department updated successfully",
      data,
    });
  } catch (error) {
    console.error("Update department error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to update department",
      error: error.message,
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
