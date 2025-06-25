const express = require("express");
const router = express.Router();
const clearkClientInstance = require("../../../config/clerkClient");
const supabase = require("../../../config/supabaseClient");

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body.body || req.body;

    // Validate email
    if (!email) {
      return res.status(400).json({
        status: "error",
        code: "VALIDATION_ERROR",
        message: "Email is required",
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        status: "error",
        code: "VALIDATION_ERROR", 
        message: "Invalid email format",
      });
    }

    console.log("Password reset requested for:", email);

    try {
      const clerk = clearkClientInstance();
      
      const passwordReset = await clerk.users.createPasswordReset({
        email_address: email.toLowerCase().trim(),
        redirect_url: `${'http://localhost:5176'}/login?reset=success`
      });

      console.log("Password reset created successfully:", passwordReset.id);

      try {
        const { data: user } = await supabase
          .from("users")
          .select("id")
          .eq("email", email.toLowerCase())
          .single();

        if (user) {
          console.log("Password reset for user ID:", user.id);
        }
      } catch (dbError) {
        console.log("Database logging failed:", dbError);
      }

      res.json({
        status: "success",
        message: "A password reset link has been sent to your email address. Please check your inbox and follow the instructions.",
        data: {
          reset_id: passwordReset.id,
          email: email.toLowerCase()
        }
      });

    } catch (clerkError) {
      console.error("Clerk password reset error:", clerkError);
      
      if (clerkError.errors && clerkError.errors.length > 0) {
        const error = clerkError.errors[0];
        console.log("Clerk error code:", error.code);
        console.log("Clerk error message:", error.message);
        
        if (error.code === "form_identifier_not_found") {
          return res.json({
            status: "success",
            message: "If an account with this email exists, you will receive a password reset link shortly.",
          });
        }
        
        if (error.code === "rate_limit_exceeded") {
          return res.status(429).json({
            status: "error",
            code: "RATE_LIMIT_EXCEEDED",
            message: "Too many password reset attempts. Please try again later.",
          });
        }
      }
      
      res.json({
        status: "success",
        message: "If an account with this email exists, you will receive a password reset link shortly.",
      });
    }

  } catch (error) {
    console.error("Password reset error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to process password reset request",
      error: error.message,
    });
  }
});

router.post("/check-password-reset-availability", async (req, res) => {
  try {
    const { email } = req.body.body || req.body;

    if (!email) {
      return res.status(400).json({
        status: "error",
        message: "Email is required",
      });
    }

    // Check if user exists in your database
    const { data: user, error } = await supabase
      .from("users")
      .select("id, email, clerk_id")
      .eq("email", email.toLowerCase())
      .single();

    if (error || !user) {
      return res.json({
        status: "success",
        available: false,
        message: "Password reset availability cannot be determined",
      });
    }

    const available = !!user.clerk_id;

    res.json({
      status: "success",
      available,
      message: available 
        ? "Password reset is available for this email"
        : "Password reset is not available for this email",
    });

  } catch (error) {
    console.error("Password reset availability check error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to check password reset availability",
    });
  }
});

router.post("/clerk-password-reset-webhook", async (req, res) => {
  try {
    const { type, data } = req.body;

    console.log("Clerk webhook received:", type);

    switch (type) {
      case 'user.password_reset.created':
        console.log("Password reset created for user:", data.user_id);
        
        try {
          await supabase
            .from("users")
            .update({ 
              updated_at: new Date().toISOString(),
            })
            .eq("clerk_id", data.user_id);
        } catch (dbError) {
          console.error("Database update failed:", dbError);
        }
        break;

      case 'user.password_reset.succeeded':
        console.log("Password reset succeeded for user:", data.user_id);
        
        try {
          await supabase
            .from("users")
            .update({ 
              updated_at: new Date().toISOString(),
            })
            .eq("clerk_id", data.user_id);
        } catch (dbError) {
          console.error("Database update failed:", dbError);
        }
        break;

      case 'user.password_reset.failed':
        console.log("Password reset failed for user:", data.user_id);
        break;

      default:
        console.log("Unhandled webhook type:", type);
    }

    res.json({ received: true });

  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
});

module.exports = router;