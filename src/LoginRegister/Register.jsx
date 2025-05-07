import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"
import { clerk, loadClerk } from '../Library/clerk';
import { Card, CardContent } from "@/components/ui/card"
import APIrequest from "../Library/axios";
import { User } from "../Library/API";
import { useNavigate } from "react-router-dom";
import { $ajax_post } from "../Library/Library";

const Register = () => {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: ""
    });
    const navigate = useNavigate();
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        console.log(name, value)
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

        if (!formData.fistName) {
            newErrors.fistName = "First Name is required";
        }

        if (!formData.lastName) {
            newErrors.lastName = "Last Name is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // try {
        //     $ajax_post("createUser", { ...formData }, (response) => {
        //         console.log(response, 'response')
        //         const { success } = response
        //         navigate('/');
        //         // if (success) {
        //         //     alert("Registration successful!");

        //         // } else {
        //         //     alert("Registration failed!");
        //         // }

        //     })


        // } catch (error) {
        //     console.log(error)
        // }

        try {
            $ajax_post("createUser", { ...formData }, function (response) {
                navigate('/');
            });
        } catch (error) {
            console.error("There was an error!", error);
        }
    };

    useEffect(() => {
        loadClerk()

    })

    const handleRedirect = () => {
        window.location.hash = '#/'; // Navigates to #/register
    };

    return (
        <>
            <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#7939d7] to-[#a770f7]">
                <Card className="w-[450px] bg-white border-none p-6 shadow-none">
                    <CardContent className="p-0">
                        <form onSubmit={handleSubmit} className="">
                            <div className="mb-4">
                                <Label className="mb-2" htmlFor="email">
                                    FirstName
                                </Label>
                                <Input
                                    className="h-[40px]"
                                    id="firstName"
                                    name="firstName"
                                    type="text"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                />
                                {errors.email && (
                                    <p className="text-sm text-red-500">{errors.firstName}</p>
                                )}
                            </div>
                            <div className="mb-4">
                                <Label className="mb-2" htmlFor="email">
                                    LastName
                                </Label>
                                <Input
                                    className="h-[40px]"
                                    id="lastName"
                                    name="lastName"
                                    type="text"

                                    value={formData.lastName}
                                    onChange={handleChange}
                                />
                                {errors.email && (
                                    <p className="text-sm text-red-500">{errors.lastName}</p>
                                )}
                            </div>
                            <div className="mb-4">
                                <Label className="mb-2" htmlFor="email">
                                    Email
                                </Label>
                                <Input
                                    className="h-[40px]"
                                    id="email"
                                    name="email"
                                    type="email"

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
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                                {errors.password && (
                                    <p className="text-sm text-red-500">{errors.password}</p>
                                )}
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-[#000] text-white h-[40px] cursor-pointer"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Registering..." : "Register"}
                            </Button>
                        </form>
                        <span>
                            If you have  account click here ,{' '}
                            <a onClick={handleRedirect} style={{ cursor: 'pointer', color: 'black', textDecoration: 'none' }}>
                                Login
                            </a>
                        </span>
                    </CardContent>
                </Card>
            </main>
        </>
    )
}

export default Register