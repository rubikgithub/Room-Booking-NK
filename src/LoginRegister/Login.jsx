import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { clerk, loadClerk } from "../LoginRegister/clerk";
import ForgetPassword from "./ForgetPassword";
import { $ajax_post } from "../Library";

// Constants
const VALIDATION_RULES = {
  email: {
    required: "Email is required",
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: "Please enter a valid email address",
    },
  },
  password: {
    required: "Password is required",
    minLength: {
      value: 6,
      message: "Password must be at least 6 characters long",
    },
  },
};

const Login = () => {
  // State management
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isForgetPasswordOpen, setIsForgetPasswordOpen] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const [isClerkLoaded, setIsClerkLoaded] = useState(false);

  // Initialize Clerk
  useEffect(() => {
    const initClerk = async () => {
      try {
        await loadClerk();
        setIsClerkLoaded(true);
      } catch (error) {
        console.error("Failed to load Clerk:", error);
        setGeneralError(
          "Authentication service failed to load. Please refresh the page."
        );
      }
    };
    initClerk();
  }, []);

  // Form validation
  const validateField = useCallback((name, value) => {
    const rules = VALIDATION_RULES[name];
    if (!rules) return "";

    if (rules.required && !value) {
      return rules.required;
    }

    if (rules.pattern && value && !rules.pattern.value.test(value)) {
      return rules.pattern.message;
    }

    if (rules.minLength && value && value.length < rules.minLength.value) {
      return rules.minLength.message;
    }

    return "";
  }, []);

  const validateAllFields = useCallback(() => {
    const newErrors = {};
    Object.keys(formData).forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, validateField]);

  // Event handlers
  const handleInputChange = useCallback(
    (e) => {
      const { name, value } = e.target;

      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));

      // Clear field error on input
      if (errors[name]) {
        setErrors((prev) => ({
          ...prev,
          [name]: "",
        }));
      }

      // Clear general error when user starts typing
      if (generalError) {
        setGeneralError("");
      }
    },
    [errors, generalError]
  );

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const handleRedirectToRegister = useCallback(() => {
    window.location.hash = "#/register";
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isClerkLoaded) {
      setGeneralError("Authentication service is not ready. Please try again.");
      return;
    }

    if (!validateAllFields()) {
      return;
    }

    setIsSubmitting(true);
    setGeneralError("");

    try {
      const authData = {
        identifier: formData.email,
        password: formData.password,
      };

      // Check if user exists first
      await new Promise((resolve, reject) => {
        $ajax_post(
          `getUserByEmail/${formData.email}`,
          {},
          async function (response) {
            try {
              if (!response || response.error || response.status === "Pending") {
                throw new Error("User not found");
              }

              // Attempt sign in with Clerk
              const signInAttempt = await clerk.client.signIn.create(authData);

              if (signInAttempt.status === "complete") {
                // Store user data
                localStorage.setItem("userData", JSON.stringify(signInAttempt));

                // Successful login - redirect or reload
                window.location.reload();
                resolve(signInAttempt);
              } else {
                throw new Error("Sign in incomplete");
              }
            } catch (error) {
              reject(error);
            }
          },
          function (error) {
            reject(new Error("Network error occurred"));
          }
        );
      });
    } catch (error) {
      console.error("Login error:", error);

      // Handle specific error types
      if (
        error.message?.includes("Invalid credentials") ||
        error.message?.includes("User not found")
      ) {
        setGeneralError(
          "Invalid email or password. Please check your credentials and try again."
        );
      } else if (error.message?.includes("Network")) {
        setGeneralError(
          "Network error. Please check your connection and try again."
        );
      } else {
        setGeneralError(
          "Login failed. Please try again or contact support if the problem persists."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Keyboard event handler
  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === "Enter" && !isSubmitting) {
        handleSubmit(e);
      }
    },
    [isSubmitting]
  );

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#7939d7] to-[#a770f7] p-4">
      <Card className="w-full max-w-md bg-white border-none shadow-lg">
        <CardContent className="space-y-4">
          {generalError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{generalError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Email Field */}
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-medium text-gray-700"
              >
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                className={`h-11 ${
                  errors.email ? "border-red-500 focus:border-red-500" : ""
                }`}
                autoComplete="email"
                disabled={isSubmitting}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
              {errors.email && (
                <p
                  id="email-error"
                  className="text-sm text-red-600 flex items-center gap-1"
                >
                  <AlertCircle className="h-3 w-3" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-sm font-medium text-gray-700"
              >
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  className={`h-11 pr-10 ${
                    errors.password ? "border-red-500 focus:border-red-500" : ""
                  }`}
                  autoComplete="current-password"
                  disabled={isSubmitting}
                  aria-describedby={
                    errors.password ? "password-error" : undefined
                  }
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  disabled={isSubmitting}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p
                  id="password-error"
                  className="text-sm text-red-600 flex items-center gap-1"
                >
                  <AlertCircle className="h-3 w-3" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Forgot Password Link */}
            <div className="flex justify-end">
              <Dialog
                open={isForgetPasswordOpen}
                onOpenChange={setIsForgetPasswordOpen}
              >
                <DialogTrigger asChild>
                  <button
                    type="button"
                    className="text-sm text-[#7939d7] hover:text-[#6b2dc7] hover:underline focus:outline-none focus:underline"
                    disabled={isSubmitting}
                  >
                    Forgot your password?
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] bg-white">
                  <ForgetPassword setIsOpenDialog={setIsForgetPasswordOpen} />
                </DialogContent>
              </Dialog>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-11 bg-black hover:bg-gray-800 text-white font-medium transition-colors duration-200"
              disabled={isSubmitting || !isClerkLoaded}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          {/* Register Link */}
          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={handleRedirectToRegister}
                className="text-[#7939d7] hover:text-[#6b2dc7] hover:underline font-medium focus:outline-none focus:underline"
                disabled={isSubmitting}
              >
                Create one here
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
};

export default Login;
