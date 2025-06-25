import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSignIn } from "@clerk/clerk-react";
import { $ajax_post } from "../Library";
import {
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Loader2,
  ArrowLeft,
  Mail,
  Lock,
  Shield,
} from "lucide-react";

const ForgetPassword = ({ setIsOpenDialog }) => {
  // States
  const [currentStep, setCurrentStep] = useState("email");
  const [loading, setLoading] = useState(false);

  // Form data
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

  // Clerk states
  const { signIn } = useSignIn();
  const [emailAddressId, setEmailAddressId] = useState(null);
  const [userId, setUserId] = useState(null);

  // Clear errors when inputs change
  useEffect(() => {
    setErrors({});
    setMessage("");
  }, [email, code, password, confirmPassword]);

  // Validation functions
  const validateEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setErrors({ email: "Email is required" });
      return false;
    }
    if (!emailRegex.test(email)) {
      setErrors({ email: "Please enter a valid email address" });
      return false;
    }
    return true;
  };

  const validateCode = () => {
    if (!code.trim()) {
      setErrors({ code: "Verification code is required" });
      return false;
    }
    if (code.length !== 6) {
      setErrors({ code: "Please enter the complete 6-digit code" });
      return false;
    }
    return true;
  };

  const validatePasswords = () => {
    const newErrors = {};

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      newErrors.password =
        "Password must contain uppercase, lowercase, and number";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Step 1: Send verification code
  const handleSendCode = async () => {
    if (!validateEmail()) return;

    setLoading(true);
    setErrors({});
    setMessage("");

    try {
      const signInAttempt = await signIn.create({
        identifier: email.toLowerCase().trim(),
      });

      const emailFactor = signInAttempt.supportedFirstFactors.find(
        (factor) => factor.strategy === "email_code"
      );

      if (!emailFactor) {
        throw new Error("Email verification not supported for this account");
      }

      await signIn.prepareFirstFactor({
        strategy: "email_code",
        emailAddressId: emailFactor.emailAddressId,
      });

      setEmailAddressId(emailFactor.emailAddressId);
      setCurrentStep("code");
      setMessage(`Code sent to ${email}`);
    } catch (error) {
      console.error("Send code error:", error);

      if (error.errors && error.errors.length > 0) {
        const clerkError = error.errors[0];

        if (clerkError.code === "form_identifier_not_found") {
          setErrors({ email: "No account found with this email address" });
        } else if (clerkError.code === "rate_limit_exceeded") {
          setErrors({ email: "Too many attempts. Please try again later" });
        } else {
          setErrors({
            email: clerkError.message || "Failed to send verification code",
          });
        }
      } else {
        setErrors({
          email: "Failed to send verification code. Please try again.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify code
  const handleVerifyCode = async () => {
    if (!validateCode()) return;

    setLoading(true);
    setErrors({});
    setMessage("");

    console.log("🔍 Step 1: Getting user by email first...");

    try {
      $ajax_post(
        `/getUserByEmail/${email.toLowerCase().trim()}`,
        {},
        async function (userResponse) {
          console.log("User response:", userResponse);

          if (userResponse?.id) {
            const supabaseUserId = userResponse.id;
            const clerkId = userResponse.clerk_id;

            try {
              const attempt = await signIn.attemptFirstFactor({
                strategy: "email_code",
                code: code.trim(),
              });

              if (attempt.status === "complete" && attempt.createdSessionId) {
                $ajax_post(
                  `/revokeSession/${attempt.createdSessionId}`,
                  {},
                  function (revokeResponse) {
                    setUserId(supabaseUserId); // Use Supabase user ID
                    setCurrentStep("password");
                    setMessage("Code verified successfully!");
                  }
                );
                setLoading(false);
              } else {
                throw new Error(
                  "Verification incomplete - status: " + attempt.status
                );
              }
            } catch (verifyError) {
              console.error("Code verification error:", verifyError);
              if (verifyError.errors && verifyError.errors.length > 0) {
                const clerkError = verifyError.errors[0];

                if (clerkError.code === "form_code_incorrect") {
                  setErrors({
                    code: "Invalid verification code. Please try again.",
                  });
                } else if (clerkError.code === "verification_expired") {
                  setErrors({
                    code: "Code has expired. Please request a new one.",
                  });
                } else {
                  setErrors({
                    code: clerkError.message || "Invalid verification code",
                  });
                }
              } else {
                setErrors({ code: "Failed to verify code. Please try again." });
              }

              setLoading(false);
            }
          } else {
            console.error("❌ User not found in database");
            setErrors({
              code: "User account not found. Please contact support.",
            });
            setLoading(false);
          }
        }
      );
    } catch (error) {
      console.error("❌ Get user error:", error);
      setErrors({ code: "Failed to verify user. Please try again." });
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!validatePasswords()) return;

    setLoading(true);
    setErrors({});
    setMessage("");

    try {
      $ajax_post(
        `/updatePassword/${userId}`,
        {
          password: password,
          confirmPassword: confirmPassword,
        },
        function (response) {
          if (response.email) {
            setMessage("Password updated successfully!");
            setTimeout(() => {
              setIsOpenDialog(false);
            }, 1500);
          } else {
            setErrors({
              password: response.message || "Failed to update password",
            });
          }
        }
      );
    } catch (error) {
      console.error("Update password error:", error);
      setErrors({ password: "Failed to update password. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    setMessage("");

    try {
      await signIn.prepareFirstFactor({
        strategy: "email_code",
        emailAddressId: emailAddressId,
      });

      setMessage(`New code sent to ${email}`);
    } catch (error) {
      setMessage("Failed to resend code");
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    if (currentStep === "code") {
      setCurrentStep("email");
      setCode("");
    } else if (currentStep === "password") {
      setCurrentStep("code");
      setPassword("");
      setConfirmPassword("");
    }
    setErrors({});
    setMessage("");
  };

  const getStepIcon = () => {
    switch (currentStep) {
      case "email":
        return <Mail className="w-6 h-6 text-purple-600" />;
      case "code":
        return <Shield className="w-6 h-6 text-purple-600" />;
      case "password":
        return <Lock className="w-6 h-6 text-purple-600" />;
      default:
        return <Mail className="w-6 h-6 text-purple-600" />;
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-50 rounded-full mb-4">
          {getStepIcon()}
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {currentStep === "email" && "Reset Password"}
          {currentStep === "code" && "Enter Code"}
          {currentStep === "password" && "New Password"}
        </h2>
        <p className="text-gray-600 text-sm">
          {currentStep === "email" &&
            "Enter your email to receive a verification code"}
          {currentStep === "code" && "We sent a 6-digit code to your email"}
          {currentStep === "password" &&
            "Create a strong password for your account"}
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center space-x-2">
          <div
            className={`w-3 h-3 rounded-full ${
              currentStep === "email" ? "bg-purple-600" : "bg-purple-600"
            }`}
          ></div>
          <div
            className={`w-8 h-0.5 ${
              currentStep !== "email" ? "bg-purple-600" : "bg-gray-300"
            }`}
          ></div>
          <div
            className={`w-3 h-3 rounded-full ${
              currentStep === "code"
                ? "bg-purple-600"
                : currentStep === "password"
                ? "bg-purple-600"
                : "bg-gray-300"
            }`}
          ></div>
          <div
            className={`w-8 h-0.5 ${
              currentStep === "password" ? "bg-purple-600" : "bg-gray-300"
            }`}
          ></div>
          <div
            className={`w-3 h-3 rounded-full ${
              currentStep === "password" ? "bg-purple-600" : "bg-gray-300"
            }`}
          ></div>
        </div>
      </div>

      {/* Success/Error Messages */}
      {message && (
        <div className="flex items-center gap-3 p-4 mb-6 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          <span className="text-sm text-green-700">{message}</span>
        </div>
      )}

      {/* Step 1: Email Input */}
      {currentStep === "email" && (
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 mb-4">
              Email Address
            </label>
            <div className="mt-2">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`pl-4 pr-4 py-3 text-base ${
                  errors.email
                    ? "border-red-300 focus:border-red-500"
                    : "border-gray-300 focus:border-blue-500"
                }`}
              />
            </div>
            {errors.email && (
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{errors.email}</span>
              </div>
            )}
          </div>

          <Button
            onClick={handleSendCode}
            disabled={loading || !email.trim()}
            className="w-full py-3 text-base text-white  font-medium bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:text-black"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending Code...
              </>
            ) : (
              "Send Verification Code"
            )}
          </Button>
        </div>
      )}

      {/* Step 2: Code Verification */}
      {currentStep === "code" && (
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Verification Code
            </label>
            <div className="relative">
              <Input
                type="text"
                placeholder="000000"
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                className={`pl-4 pr-4 py-3 text-base text-center tracking-widest ${
                  errors.code
                    ? "border-red-300 focus:border-red-500"
                    : "border-gray-300 focus:border-blue-500"
                }`}
                maxLength={6}
              />
            </div>
            {errors.code && (
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{errors.code}</span>
              </div>
            )}
            <p className="text-xs text-gray-500 text-center">
              Sent to <span className="font-medium">{email}</span>
            </p>
          </div>

          <Button
            onClick={handleVerifyCode}
            disabled={loading || code.length !== 6}
            className="w-full py-3 text-base text-white font-medium bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:text-black"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify Code"
            )}
          </Button>

          <div className="flex items-center justify-between text-sm">
            <button
              onClick={goBack}
              className="flex items-center gap-1 text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <button
              onClick={handleResendCode}
              disabled={loading}
              className="text-blue-600 hover:text-blue-800 disabled:opacity-50"
            >
              Resend Code
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Password Update */}
      {currentStep === "password" && (
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                New Password
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`pl-4 pr-12 py-3 text-base ${
                    errors.password
                      ? "border-red-300 focus:border-red-500"
                      : "border-gray-300 focus:border-blue-500"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{errors.password}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`pl-4 pr-12 py-3 text-base ${
                    errors.confirmPassword
                      ? "border-red-300 focus:border-red-500"
                      : "border-gray-300 focus:border-blue-500"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{errors.confirmPassword}</span>
                </div>
              )}
            </div>
          </div>

          {/* Password Requirements */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Password must contain:
            </p>
            <div className="space-y-1 text-xs">
              <div
                className={`flex items-center gap-2 ${
                  password.length >= 8 ? "text-green-600" : "text-gray-500"
                }`}
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full ${
                    password.length >= 8 ? "bg-green-600" : "bg-gray-400"
                  }`}
                ></div>
                At least 8 characters
              </div>
              <div
                className={`flex items-center gap-2 ${
                  /[A-Z]/.test(password) ? "text-green-600" : "text-gray-500"
                }`}
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full ${
                    /[A-Z]/.test(password) ? "bg-green-600" : "bg-gray-400"
                  }`}
                ></div>
                One uppercase letter
              </div>
              <div
                className={`flex items-center gap-2 ${
                  /[a-z]/.test(password) ? "text-green-600" : "text-gray-500"
                }`}
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full ${
                    /[a-z]/.test(password) ? "bg-green-600" : "bg-gray-400"
                  }`}
                ></div>
                One lowercase letter
              </div>
              <div
                className={`flex items-center gap-2 ${
                  /\d/.test(password) ? "text-green-600" : "text-gray-500"
                }`}
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full ${
                    /\d/.test(password) ? "bg-green-600" : "bg-gray-400"
                  }`}
                ></div>
                One number
              </div>
            </div>
          </div>

          <Button
            onClick={handleUpdatePassword}
            disabled={loading || !password || !confirmPassword}
            className="w-full py-3 text-base font-medium bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:text-black"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Updating Password...
              </>
            ) : (
              "Update Password"
            )}
          </Button>

          <button
            onClick={goBack}
            className="w-full flex items-center justify-center gap-1 text-sm text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>
      )}
    </div>
  );
};

export default ForgetPassword;
