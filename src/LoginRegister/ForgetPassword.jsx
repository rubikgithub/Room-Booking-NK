import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"
import { clerk, loadClerk } from '../Library/clerk';
import { Card, CardContent } from "@/components/ui/card"


const ForgetPassword = () => {
    // const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
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
                            <Button
                                type="submit"
                                className="w-full bg-[#000] text-white h-[40px] cursor-pointer"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Sending..." : "Send"}
                            </Button>
                        </form>
                        {/* <span>
                            If you have no account yet,{' '}
                            <a onClick={handleRedirect} style={{ cursor: 'pointer', color: 'black', textDecoration: 'none' }}>
                                Register
                            </a>
                        </span> */}
                    </CardContent>
                </Card>
            </main>
        </>
    )
}

export default ForgetPassword