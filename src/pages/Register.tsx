
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
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
import { ArrowLeft, ArrowRight, CheckCircle2, ShieldCheck, Mail, Lock, User } from "lucide-react";

// Schema for Registration Details
const registerSchema = z.object({
    fullName: z.string().min(2, { message: "Name must be at least 2 characters" }),
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

// Schema for OTP
const otpSchema = z.object({
    otp: z.string().min(6, { message: "Your one-time password must be 6 characters." }),
});

const Register = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState<"details" | "otp">("details");
    const [isLoading, setIsLoading] = useState(false);
    const [userEmail, setUserEmail] = useState("");

    // Forms
    const detailsForm = useForm<z.infer<typeof registerSchema>>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            fullName: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    });

    const otpForm = useForm<z.infer<typeof otpSchema>>({
        resolver: zodResolver(otpSchema),
        defaultValues: {
            otp: "",
        },
    });

    // Handlers
    const onDetailsSubmit = async (values: z.infer<typeof registerSchema>) => {
        setIsLoading(true);
        // Simulate API call to send OTP
        const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();
        setTimeout(() => {
            setIsLoading(false);
            setUserEmail(values.email);
            setStep("otp");
            // Store OTP in localStorage or state for verification if needed, 
            // but for now we just show it to the user.
            toast.info("OTP Sent", {
                description: `Your verification code is: ${mockOtp}`,
                duration: 10000,
            });
            console.log("Mock OTP:", mockOtp); // For debugging
        }, 1500);
    };

    const onOtpSubmit = async (values: z.infer<typeof otpSchema>) => {
        setIsLoading(true);
        // Simulate API verification
        setTimeout(() => {
            setIsLoading(false);
            console.log("Verified OTP:", values.otp);
            toast.success("Account Created!", {
                description: "Your account has been successfully verified.",
            });
            navigate("/login");
        }, 1500);
    };

    return (
        <div className="w-full h-screen flex overflow-hidden bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">

            {/* LEFT PANEL - FORM */}
            <div className="w-full lg:w-[480px] xl:w-[550px] flex flex-col justify-center p-8 lg:p-12 xl:p-16 relative z-10 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 shadow-xl transition-colors">

                <div className="max-w-[360px] mx-auto w-full space-y-8 animate-in slide-in-from-left-8 fade-in duration-700">

                    {/* Header */}
                    <div>
                        <Button variant="ghost" className="pl-0 gap-2 hover:bg-transparent hover:text-indigo-600 dark:hover:text-violet-400 mb-6" onClick={() => navigate("/login")}>
                            <ArrowLeft className="w-4 h-4" /> Back to Login
                        </Button>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Create Account</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-2">
                            {step === "details" ? "Enter your details to get started." : "Verify your email address."}
                        </p>
                    </div>

                    {/* STEP 1: DETAILS FORM */}
                    {step === "details" && (
                        <Form {...detailsForm}>
                            <form onSubmit={detailsForm.handleSubmit(onDetailsSubmit)} className="space-y-4">
                                <FormField
                                    control={detailsForm.control}
                                    name="fullName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Full Name</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                                    <Input placeholder="John Doe" {...field} className="pl-9 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-violet-500/20 focus:border-indigo-400 dark:focus:border-violet-500 transition-all" />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={detailsForm.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email Address</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                                    <Input placeholder="john@university.edu" {...field} className="pl-9 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-violet-500/20 focus:border-indigo-400 dark:focus:border-violet-500 transition-all" />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={detailsForm.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Password</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                                    <Input type="password" placeholder="••••••••" {...field} className="pl-9 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-violet-500/20 focus:border-indigo-400 dark:focus:border-violet-500 transition-all" />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={detailsForm.control}
                                    name="confirmPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Confirm Password</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                                    <Input type="password" placeholder="••••••••" {...field} className="pl-9 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-violet-500/20 focus:border-indigo-400 dark:focus:border-violet-500 transition-all" />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Button type="submit" className="w-full mt-4 bg-slate-900 hover:bg-slate-800 dark:bg-violet-600 dark:hover:bg-violet-500 text-white" disabled={isLoading}>
                                    {isLoading ? "Processing..." : "Continue"}
                                </Button>
                            </form>
                        </Form>
                    )}

                    {/* STEP 2: OTP FORM */}
                    {step === "otp" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                            <div className="bg-indigo-50 dark:bg-violet-900/20 p-4 rounded-lg border border-indigo-100 dark:border-violet-500/20 text-center">
                                <p className="text-sm text-indigo-800 dark:text-violet-200">
                                    We verified your details. Please enter the 6-digit code sent to <span className="font-semibold">{userEmail}</span>.
                                </p>
                            </div>

                            <Form {...otpForm}>
                                <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-6">
                                    <FormField
                                        control={otpForm.control}
                                        name="otp"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col items-center">
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
                                    <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-violet-600 dark:hover:bg-violet-500 text-white" disabled={isLoading}>
                                        {isLoading ? "Verifying..." : "Verify & Create Account"}
                                    </Button>

                                    <div className="text-center">
                                        <Button variant="link" size="sm" className="text-slate-500" onClick={() => setStep("details")} type="button">
                                            Change Email or Resend
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </div>
                    )}

                </div>
            </div>

            {/* RIGHT PANEL - ART */}
            <div className="hidden lg:block flex-1 relative bg-slate-50 dark:bg-slate-950 overflow-hidden transition-colors">
                <div className="absolute inset-0 bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-indigo-200 via-slate-100 to-indigo-50 dark:from-violet-950 dark:via-slate-950 dark:to-slate-900 transition-colors"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center max-w-lg p-8">
                        <div className="mb-6 inline-flex p-4 bg-white/50 dark:bg-white/5 backdrop-blur-xl rounded-2xl shadow-xl ring-1 ring-black/5 dark:ring-white/10">
                            <ShieldCheck className="w-12 h-12 text-indigo-600 dark:text-violet-400" />
                        </div>
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Secure & Automated</h2>
                        <p className="text-lg text-slate-600 dark:text-slate-400">Join thousands of faculty members managing their academic life with intelligent scheduling.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
