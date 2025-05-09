import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"


import { clerk, loadClerk } from '../LoginRegister/clerk';
import { Card, CardContent } from "@/components/ui/card"
import { useSignIn, useClerk } from "@clerk/clerk-react";
import { $ajax_post } from "../Library";
import { Eye, EyeOff } from "lucide-react"

const ForgetPassword = ({ setIsOpenDialog }) => {
    // const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);


    const { signIn, setSession } = useSignIn();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [verifyCode, setVerifyCode] = useState(false);
    const [code, setCode] = useState('');
    const [pending, setPending] = useState(false);
    const [identifier, setIdentifier] = useState(null);
    const { client } = useClerk();
    const [updatePassword, setUpdatePassword] = useState(false);
    const [showPassword, setShowPassword] = useState(false)

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validate = () => {
        const newErrors = {};

        // if (!formData.email) {
        //     newErrors.email = "Email is required";
        // } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        //     newErrors.email = "Email is invalid";
        // }

        if (!password) {
            newErrors.password_req = "Password is required";
        } else if (password.length < 6) {
            newErrors.password_req = "Password must be at least 6 characters";
        }
        password !== confirmPassword ? newErrors.password = "Passwords do not match" : null

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSendCode = async () => {
        try {
            const result = await signIn.create({ identifier: email });
            const emailFactor = result.supportedFirstFactors.find(
                factor => factor.strategy === "email_code"
            );
            const respo = await signIn.prepareFirstFactor({ strategy: "email_code", emailAddressId: emailFactor.emailAddressId });
            console.log(respo, 'respo');
            setPending(true);
            setEmail('');
            setIdentifier(emailFactor.emailAddressId);
        } catch (err) {
            alert(err?.message);
        }
    };

    const handleVerifyCode = async () => {
        console.log(identifier, code, 'sdfsf');
        try {
            const attempt = await signIn.attemptFirstFactor({
                strategy: "email_code",
                code: code
            });
            console.log(attempt?.createdSessionId, 'attempt');
            $ajax_post(`/revokeSession/${attempt?.createdSessionId}`, {}, function (response) {
                console.log(response?.userId, 'response');
                localStorage.setItem('userId', response?.userId);
                setVerifyCode(true);

            });
        } catch (err) {
            alert(err?.message);
        }
    };

    const handleUpdatePassword = async () => {
        try {
            if (validate()) {
                $ajax_post(`/updatePassword/${localStorage.getItem('userId')}`, { "password": password }, function (response) {
                    console.log(response, 'responseupdate');
                    alert("Password updated successfully");
                    setIsOpenDialog(false);
                });
            }
        } catch (err) {
            alert(err?.message);
        }
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
                    password: formData.password
                }

                const signInAttempt = await clerk.client.signIn.create(authData)
                console.log(signInAttempt, 'data')
                localStorage.setItem('userData', JSON.stringify(signInAttempt))

                alert("Login successful!");
                window.location.reload();

            }
        } catch (error) {
            console.log(error)
            alert("Invalid ");
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        loadClerk()
    })

    return (
        <>


            {
                !verifyCode ? <div className="grid gap-4 py-4">
                    {
                        !pending ? (
                            <div>
                                <p className="text-2xl font-bold mb-4">Forget Password</p>
                                <div className="grid grid-cols-4 items-center gap-4 mb-4">
                                    <Input
                                        id="email"
                                        className="col-span-4"
                                        placeholder="Enter email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Button
                                        type="submit"
                                        className="w-full bg-[#000] text-white h-[40px] cursor-pointer"
                                        // disabled={isSubmitting}
                                        onClick={handleSendCode}
                                    >
                                        Send
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <p className="text-2xl font-bold mb-4">Verify Code</p>
                                <div className="grid grid-cols-4 items-center gap-4 mb-4">
                                    <Input
                                        id="otp"
                                        className="col-span-4"
                                        placeholder="Enter Code"
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                    />

                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-[#000] text-white h-[40px] cursor-pointer"
                                    disabled={isSubmitting}
                                    onClick={handleVerifyCode}
                                >
                                    Verfiy Code
                                </Button>
                            </div>
                        )
                    }


                </div> :
                    <div>
                        <p className="text-2xl font-bold mb-4">Update Password</p>
                        <div className="grid grid-cols-4 items-center gap-4 mb-4">
                            <Input
                                id="password"
                                className="col-span-4"
                                placeholder="Enter Password"
                                type={"password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            {errors.password_req && (
                                <p className="text-sm text-red-500" style={{ width: "500px" }}>{errors.password_req}</p>
                            )}
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4 mb-4">
                            <Input
                                id="confirm-password"
                                className="col-span-4"
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter Confirm Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}

                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-6 top-31 -translate-y-0"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" onClick={() => setShowPassword(false)} /> : <Eye className="w-4 h-4" onClick={() => setShowPassword(true)} />}
                            </Button>
                            {errors.password && (
                                <p className="text-sm text-red-500" style={{ width: "500px" }}>{errors.password}</p>
                            )}
                        </div>
                        <div>
                            <Button
                                type="submit"
                                className="w-full bg-[#000] text-white h-[40px] cursor-pointer"
                                // disabled={isSubmitting}
                                // onClick={handleSendCode}
                                onClick={handleUpdatePassword}
                            >
                                Update Password
                            </Button>
                        </div>
                    </div>
            }




            {/* <div>
                <input
                    type="email"
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                {!pending ? (
                    <button onClick={handleSendCode}>Send Code</button>
                ) : (
                    <>
                        <input
                            type="text"
                            placeholder="Enter code"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                        />
                        <button onClick={handleVerifyCode}>Verify Code</button>
                    </>
                )}
            </div> */}
            {/* <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#7939d7] to-[#a770f7]">
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
                            <Button
                                type="submit"
                                className="w-full bg-[#000] text-white h-[40px] cursor-pointer"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Sending..." : "Send"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </main> */}
        </>
    )
}

export default ForgetPassword