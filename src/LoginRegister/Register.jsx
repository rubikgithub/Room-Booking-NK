import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"
import { clerk, loadClerk } from '../LoginRegister/clerk';
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { useNavigate } from "react-router-dom";
import { $ajax_post } from "../Library";
import { DatePicker, FormControl, Select, TextArea } from "unygc";
import { format } from "date-fns";


const Register = () => {
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        password: ""
    });
    const navigate = useNavigate();
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [date, setDate] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        console.log(name, value)
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleChanges = (key, value) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
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

        if (!formData.first_name) {
            newErrors.firstName = "First Name is required";
        }

        if (!formData.last_name) {
            newErrors.lastName = "Last Name is required";
        }
        if (!formData.phone_number) {
            newErrors.phone_number = "Phone Number is required";
        }
        if (!formData.department) {
            newErrors.department = "Department is required";
        }
        if (!formData.address) {
            newErrors.address = "Address is required";
        }
        if (!formData.dob) {
            newErrors.dob = "DOB is required";
        }


        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validate()) {
            setIsSubmitting(true);
            try {
                $ajax_post("createUser", { ...formData }, function (response) {
                    navigate('/');
                }, function (error) {
                    console.log(error, 'adfasdfdsf');
                    setIsSubmitting(false);
                    alert(error?.message);
                });
            } catch (error) {
                console.error("There was an error!", error);
                setIsSubmitting(false);
                alert(error?.message);
            }
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
            <div style={{ fontSize: '2rem', fontWeight: 500, textAlign: "center", paddingBottom: "20px" ,color:"#ffffff"}}>Room Booking System</div>
                <Card className="w-[450px] bg-white border-none p-6 shadow-none">
                    {/* <CardTitle style={{ fontSize: '1rem', textAlign: "center" }}>Room Booking System</CardTitle> */}
                    <CardContent className="p-0">
                        <form onSubmit={handleSubmit} className="">
                            <div className="mb-4">
                                <Label className="mb-2" htmlFor="email">
                                    First Name
                                </Label>
                                <Input
                                    className="h-[40px]"
                                    id="firstName"
                                    name="first_name"
                                    type="text"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                />
                                {errors.email && (
                                    <p className="text-sm text-red-500">{errors.firstName}</p>
                                )}
                            </div>
                            <div className="mb-4">
                                <Label className="mb-2" htmlFor="email">
                                    Last Name
                                </Label>
                                <Input
                                    className="h-[40px]"
                                    id="lastName"
                                    name="last_name"
                                    type="text"

                                    value={formData.last_name}
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
                                <Label className="mb-2" htmlFor="email">
                                    Phone Number
                                </Label>
                                <Input
                                    className="h-[40px]"
                                    id="phone_number"
                                    name="phone_number"
                                    type="phone_number"
                                    minLength={10}
                                    maxLength={10}
                                    value={formData.phone_number}
                                    onChange={handleChange}
                                />
                                {errors.phone_number && (
                                    <p className="text-sm text-red-500">{errors.phone_number}</p>
                                )}
                            </div>
                            <FormControl label="Department" required={true}>
                                <Select
                                    defaultValue={formData?.department}
                                    name="Department "
                                    selectOptions={[
                                        { label: "Math", value: "Math" },
                                        { label: "Science", value: "Science" },
                                        { label: "Music", value: "Music" },
                                        { label: "Cultural", value: "Cultural" },
                                    ]}
                                    onChange={(val) => handleChanges("department", val)}
                                />
                            </FormControl>
                            <FormControl label="Date of Birth" required={true}>
                                <DatePicker
                                    value={date || ""}
                                    onChange={(selectedDate) => {
                                        setDate(selectedDate);
                                        handleChanges("dob", format(selectedDate, "yyyy-MM-dd"));
                                    }}
                                />
                            </FormControl>
                            <FormControl label="Address" required={true}>
                                <TextArea
                                    type="text"
                                    value={formData.address || ""}
                                    placeholder="Enter Address"
                                    onChange={(e) => handleChanges("address", e)}
                                />
                            </FormControl>
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
                        <p className="text-sm text-center mt-4">
                            If you have account{' '}
                            <a onClick={handleRedirect} style={{ cursor: 'pointer', color: 'black', textDecoration: 'none' }}>
                                Click Here
                            </a>
                        </p>
                    </CardContent>
                </Card>
            </main>
        </>
    )
}

export default Register
