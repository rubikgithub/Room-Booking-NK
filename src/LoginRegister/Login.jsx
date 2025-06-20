import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { clerk, loadClerk } from "../LoginRegister/clerk";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ForgetPassword from "./ForgetPassword";
import { $ajax_post } from "../Library";

const Login = () => {
  // const navigate = useNavigate();
  const [isOpenDialog, setIsOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    console.log(e, "Test Email");
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (validate()) {
        setIsSubmitting(true);

        // Simulate API call
        console.log("Submitting:", formData);
        // Replace with actual login logic
        const authData = {
          identifier: formData.email,
          password: formData.password,
        };

        $ajax_post(
          `getUserByEmail/${formData.email || formData.email?.identifier}`,
          {},
          async function (response) {
            try {
              const signInAttempt = await clerk.client.signIn.create(authData);
              localStorage.setItem("userData", JSON.stringify(signInAttempt));
              window.location.reload();
            } catch (error) {
              console.log(error);
              alert("Invalid Credentials");
              setIsSubmitting(false);
            }
          }
        );
      }
    } catch (error) {
      console.log(error);
      alert("Invalid Credentials");
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    loadClerk();
  });

  const handleRedirect = () => {
    window.location.hash = "#/register"; // Navigates to #/register
  };

  return (
    <>
      <Dialog open={isOpenDialog} onOpenChange={setIsOpenDialog}>
        <DialogContent
          className="sm:max-w-[425px]"
          style={{ backgroundColor: "white" }}
        >
          {/* <DialogHeader>
                    <DialogTitle>Forget Password</DialogTitle>
                </DialogHeader> */}
          <ForgetPassword setIsOpenDialog={setIsOpenDialog} />
        </DialogContent>

        <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#7939d7] to-[#a770f7]">
          <Card className="w-[450px] bg-white border-none p-6 shadow-none">
            <CardContent className="p-0">
              <form onSubmit={handleSubmit} className="">
                <div className="mb-4">
                  <Label className="mb-2" htmlFor="email">
                    Email
                  </Label>
                  <Input
                    className="h-[40px]"
                    id="email"
                    name="email"
                    type="email"
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email}</p>
                  )}
                </div>

                <div className="mb-4">
                  <Label className="mb-2" htmlFor="password">
                    Password
                  </Label>
                  <Input
                    className="h-[40px]"
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  {errors.password && (
                    <p className="text-sm text-red-500">{errors.password}</p>
                  )}
                </div>
                <DialogTrigger asChild>
                  <p className="text-sm mb-2" style={{ cursor: "pointer" }}>
                    Forget Password
                  </p>
                </DialogTrigger>
                <Button
                  type="submit"
                  className="w-full bg-[#000] text-white h-[40px] cursor-pointer"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Logging in..." : "Login"}
                </Button>
              </form>
              <p className="text-sm text-center mt-2">
                If you have no account yet{" "}
                <a
                  onClick={handleRedirect}
                  style={{
                    cursor: "pointer",
                    color: "black",
                    textDecoration: "none",
                  }}
                >
                  Click Here
                </a>
              </p>
            </CardContent>
          </Card>
        </main>
      </Dialog>
    </>
  );
};

export default Login;
