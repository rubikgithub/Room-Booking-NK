const express = require("express");
const router = express.Router();
const clearkClientInstance = require("../../../config/clerkClient");
const supabase = require("../../../config/supabaseClient");
const { stat } = require("fs");

router.post("/updateUser/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedUserData = req.body.body;

    // Fetch the user's current data
    const { data: existingUser, error: fetchError } = await supabase
      .from("users")
      .select("clerk_id")
      .eq("id", id)
      .single();

    if (fetchError) throw fetchError;

    if (!existingUser || !existingUser.clerk_id) {
      return res.status(404).json({
        status: "fail",
        message: "User not found or not linked with Clerk.",
      });
    }

    const { clerk_id } = existingUser;

    try {
      const clerkResponse = await clearkClientInstance().users.updateUser(
        clerk_id,
        {
          first_name: updatedUserData.first_name,
          last_name: updatedUserData.last_name,
          email_address: updatedUserData.email,
          username: updatedUserData.username,
        }
      );
    } catch (clerkError) {
      return res.status(500).json({
        status: "fail",
        message: "Failed to update user in Clerk.",
        error: clerkError.message || clerkError,
      });
    }

    // Update user in Supabase
    const { data, error } = await supabase
      .from("users")
      .update(updatedUserData)
      .eq("id", id)
      .select();

    if (error) throw error;

    if (data.length === 0) {
      return res.status(404).json({
        status: "fail",
        message: "User not found or no changes made.",
      });
    }

    res.json({
      status: "success",
      message: "User updated successfully.",
      data,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: "Failed to update user.",
      error: error.message || error,
    });
  }
});

router.post("/deleteUser/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase.from("users").delete().eq("id", id);
    if (error) throw error;

    res.json({
      status: "success",
      message: "User deleted successfully.",
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: "Failed to delete user.",
      error: error.message || error,
    });
  }
});

router.post("/grant-access/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { password, secretKey } = req.body.body || req.body;

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", id);

    if (error) throw error;

    if (data?.length === 0) {
      return res.status(404).json({
        status: "fail",
        message: "User not found.",
      });
    }

    const user = data[0];

    const { email, first_name, last_name } = user;
    const userData = {
      external_id: id,
      first_name: first_name,
      last_name: last_name,
      email_address: [email],
      username: `${first_name}${id}`,
      password: password,
      skip_password_checks: true,
      skip_password_requirement: true,
      delete_self_enabled: true,
      create_organization_enabled: true,
      create_organizations_limit: 0,
    };
    const response = await clearkClientInstance(secretKey).users.createUser(
      userData
    );
    const { updateError } = await supabase
      .from("users")
      .update({ clerk_id: response?.id, authenticate: true })
      .eq("id", id);

    if (updateError) throw updateError;
    res.json({
      status: "success",
      message: "User granted access successfully.",
      data: response,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to give access to user.",
      error: error.message || error,
    });
  }
});

module.exports = router;
