import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Input, Button } from "@material-tailwind/react";

const Login = () => {
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [step, setStep] = useState(1);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await axios.post("http://localhost:3001/send-otp", { email });
            setStep(2);
        } catch (err) {
            setError(err.response?.data || "Error sending OTP. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await axios.post("http://localhost:3001/verify-otp", { email, otp });
            alert("Signup successful!");
            navigate("/app");
        } catch (err) {
            setError(err.response?.data || "Invalid OTP. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen mx-96 p-32">
            <div className="w-full max-w-md bg-gray-200 rounded-xl shadow-lg p-6 sm:p-8">
                <h2 className="text-3xl text-gray-800 text-center mb-6 font-semibold">
                    {step === 1 ? "Sign Up" : "Enter OTP"}
                </h2>

                {step === 1 && (
                    <form onSubmit={handleSendOtp} className="space-y-4">
                        <div className="relative">
                            <Input
                                type="email"
                                label="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                containerProps={{
                                    className: "w-full",
                                }}
                            />
                        </div>
                        <div className="flex justify-end">
                            <Button
                                size="md"
                                color={email ? "blue" : "gray"}
                                disabled={!email || loading}
                                type="submit"
                                className="w-full sm:w-auto rounded-lg px-6 py-2 shadow-md"
                            >
                                {loading ? "Sending..." : "Send OTP"}
                            </Button>
                        </div>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleVerifyOtp} className="space-y-4">
                        <div className="relative">
                            <Input
                                type="text"
                                label="Enter OTP"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                required
                                containerProps={{
                                    className: "w-full",
                                }}
                            />
                        </div>
                        <div className="flex justify-end">
                            <Button
                                size="md"
                                color={otp ? "blue" : "gray"}
                                disabled={!otp || loading}
                                type="submit"
                                className="w-full sm:w-auto rounded-lg px-6 py-2 shadow-md"
                            >
                                {loading ? "Verifying..." : "Verify OTP"}
                            </Button>
                        </div>
                    </form>
                )}

                {error && (
                    <p className="text-red-500 text-center mt-4">{error}</p>
                )}
            </div>
        </div>
    );
};

export default Login;
