// React hooks for state management
import { useState } from "react";

// React Hook Form for form handling
import { useForm } from "react-hook-form";

// Zod resolver to connect Zod validation with React Hook Form
import { zodResolver } from "@hookform/resolvers/zod";

// Zod for schema-based validation
import * as z from "zod";

// React Router utilities
import { useNavigate, Link } from "react-router-dom";

// Toast notifications
import { toast } from "sonner";

// UI Components
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

// Icons
import { ArrowLeft, ArrowRight, CheckCircle2, ShieldCheck, Mail, Lock, User } from "lucide-react";

/* -----------------------------
   ZOD SCHEMA: USER REGISTRATION
------------------------------ */
const registerSchema = z.object({
    fullName: z.string().min(2, { message: "Name must be at least 2 characters" }),
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

/* -----------------------------
   ZOD SCHEMA: OTP VALIDATION
------------------------------ */
const otpSchema = z.object({
    otp: z.string().min(6, { message: "Your one-time password must be 6 characters." }),
});

const Register = () => {
    // Navigation hook
    const navigate = useNavigate();

    // Step control: registration details or OTP verification
    const [step, setStep] = useState<"details" | "otp">("details");

    // Loading state for API simulation
    const [isLoading, setIsLoading] = useState(false);

    // Store user email for OTP screen
    const [userEmail, setUserEmail] = useState("");

    /* -----------------------------
       FORM 1: REGISTRATION DETAILS
    ------------------------------ */
    const detailsForm = useForm<z.infer<typeof registerSchema>>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            fullName: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    });

    /* -----------------------------
       FORM 2: OTP VERIFICATION
    ------------------------------ */
    const otpForm = useForm<z.infer<typeof otpSchema>>({
        resolver: zodResolver(otpSchema),
        defaultValues: {
            otp: "",
        },
    });

    /* -----------------------------
       HANDLE DETAILS SUBMISSION
       (Mock OTP generation)
    ------------------------------ */
    const onDetailsSubmit = async (values: z.infer<typeof registerSchema>) => {
        setIsLoading(true);

        // Generate mock OTP
        const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();

        setTimeout(() => {
            setIsLoading(false);
            setUserEmail(values.email);
            setStep("otp");

            // Show OTP via toast (mock backend behavior)
            toast.info("OTP Sent", {
                description: `Your verification code is: ${mockOtp}`,
                duration: 10000,
            });

            console.log("Mock OTP:", mockOtp);
        }, 1500);
    };

    /* -----------------------------
       HANDLE OTP VERIFICATION
    ------------------------------ */
    const onOtpSubmit = async (values: z.infer<typeof otpSchema>) => {
        setIsLoading(true);

        setTimeout(() => {
            setIsLoading(false);

            console.log("Verified OTP:", values.otp);

            // Success notification
            toast.success("Account Created!", {
                description: "Your account has been successfully verified.",
            });

            // Redirect to login page
            navigate("/login");
        }, 1500);
    };

    return (
        <div className="w-full h-screen flex overflow-hidden bg-white dark:bg-slate-950">

            {/* LEFT PANEL: REGISTRATION & OTP FORMS */}
            <div className="w-full lg:w-[480px] flex flex-col justify-center p-8 border-r">

                <div className="max-w-[360px] mx-auto space-y-8">

                    {/* HEADER */}
                    <div>
                        <Button
                            variant="ghost"
                            onClick={() => navigate("/login")}
                        >
                            <ArrowLeft /> Back to Login
                        </Button>

                        <h1>Create Account</h1>
                        <p>
                            {step === "details"
                                ? "Enter your details to get started."
                                : "Verify your email address."}
                        </p>
                    </div>

                    {/* STEP 1: USER DETAILS FORM */}
                    {step === "details" && (
                        <Form {...detailsForm}>
                            <form onSubmit={detailsForm.handleSubmit(onDetailsSubmit)}>

                                {/* Full Name */}
                                <FormField
                                    control={detailsForm.control}
                                    name="fullName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Full Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="John Doe" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Email */}
                                <FormField
                                    control={detailsForm.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input placeholder="john@university.edu" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Password */}
                                <FormField
                                    control={detailsForm.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Password</FormLabel>
                                            <FormControl>
                                                <Input type="password" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Confirm Password */}
                                <FormField
                                    control={detailsForm.control}
                                    name="confirmPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Confirm Password</FormLabel>
                                            <FormControl>
                                                <Input type="password" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? "Processing..." : "Continue"}
                                </Button>
                            </form>
                        </Form>
                    )}

                    {/* STEP 2: OTP VERIFICATION FORM */}
                    {step === "otp" && (
                        <Form {...otpForm}>
                            <form onSubmit={otpForm.handleSubmit(onOtpSubmit)}>

                                <p>
                                    Enter the 6-digit OTP sent to <b>{userEmail}</b>
                                </p>

                                <FormField
                                    control={otpForm.control}
                                    name="otp"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <InputOTP maxLength={6} {...field}>
                                                    <InputOTPGroup>
                                                        <InputOTPSlot index={0} />
                                                        <InputOTPSlot index={1} />
                                                        <InputOTPSlot index={2} />
                                                    </InputOTPGroup>
                                                    <InputOTPGroup>
                                                        <InputOTPSlot index={3} />
                                                        <InputOTPSlot index={4} />
                                                        <InputOTPSlot index={5} />
                                                    </InputOTPGroup>
                                                </InputOTP>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? "Verifying..." : "Verify & Create Account"}
                                </Button>
                            </form>
                        </Form>
                    )}

                </div>
            </div>

            {/* RIGHT PANEL: VISUAL / BRANDING */}
            <div className="hidden lg:block flex-1 relative">
                <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                        <ShieldCheck />
                        <h2>Secure & Automated</h2>
                        <p>
                            Intelligent academic scheduling for faculty members.
                        </p>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Register;
