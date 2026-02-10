import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { loginUser } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export default function Login() {
    const [role, setRole] = useState<"admin" | "faculty">("admin");
    const [dark, setDark] = useState(false);
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const navigate = useNavigate();
    const location = useLocation();
    const { login: authLogin } = useAuth();

    const toggleTheme = () => {
        document.documentElement.classList.toggle("dark");
        setDark(!dark);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await loginUser({
                identifier,
                password,
                role,
            });

            if (response.success && response.user) {
                // Save to auth context
                authLogin(response.user, role);

                // Get the page user was trying to access, or use default
                const from = (location.state as any)?.from?.pathname ||
                    (role === "admin" ? "/admin" : "/faculty/dashboard");

                // Navigate to intended page or default
                navigate(from, { replace: true });
            } else {
                setError(response.message || "Login failed");
            }
        } catch (err) {
            setError("An unexpected error occurred. Please try again.");
            console.error("Login error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-background min-h-screen flex flex-col items-center justify-center p-4 font-sans">

            {/* HEADER */}
            <header className="absolute top-0 w-full p-8 flex justify-center">
                <div className="flex items-center space-x-2">
                    <div className="bg-primary p-1.5 rounded-lg">
                        <span className="material-icons-outlined text-primary-foreground text-xl">
                            auto_awesome
                        </span>
                    </div>
                    <span className="text-xl font-bold tracking-tight text-foreground">
                        AcadSchedule
                    </span>
                </div>
            </header>

            {/* LOGIN CARD */}
            <main className="w-full max-w-md">
                <div className="bg-card p-8 rounded-2xl shadow-xl border border-border transition hover:-translate-y-1">

                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                            Sign in to your account
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">
                            Welcome back! Please enter your details.
                        </p>
                    </div>

                    {/* ERROR MESSAGE */}
                    {error && (
                        <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                        </div>
                    )}

                    {/* DEMO CREDENTIALS */}
                    <div className="mb-6 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <p className="text-xs font-semibold text-blue-900 dark:text-blue-300 mb-1">Demo Credentials:</p>
                        <p className="text-xs text-blue-700 dark:text-blue-400">
                            Admin: admin@acadschedule.com / password123
                        </p>
                        <p className="text-xs text-blue-700 dark:text-blue-400">
                            Faculty: (any faculty email) / faculty123
                        </p>
                    </div>

                    {/* ROLE SWITCH */}
                    <div className="flex p-1 bg-slate-100 dark:bg-slate-900/50 rounded-xl mb-8">
                        <button
                            type="button"
                            onClick={() => setRole("admin")}
                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${role === "admin"
                                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                                }`}
                        >
                            Admin
                        </button>

                        <button
                            type="button"
                            onClick={() => setRole("faculty")}
                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${role === "faculty"
                                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                                }`}
                        >
                            Faculty
                        </button>
                    </div>

                    {/* FORM */}
                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                Email Address / Employee ID
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. j.doe@institution.edu"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                required
                                className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                Password
                            </label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:bg-teal-600 text-white font-semibold py-3 rounded-xl shadow-md transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Signing in..." : `Sign In as ${role}`}
                        </button>
                    </form>

                    {/* SSO */}
                    <div className="relative my-8">
                        <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
                        <div className="text-center text-sm mt-3 text-slate-400">
                            Or continue with
                        </div>
                    </div>

                    <button
                        type="button"
                        className="w-full py-2.5 border rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                    >
                        Single Sign-On (SSO)
                    </button>
                </div>

                <p className="mt-8 text-center text-xs text-slate-500">
                    © 2024 AcadSchedule. M3 Intelligent Academic Scheduling Platform.
                </p>
            </main>

            {/* DARK MODE BUTTON */}
            <button
                onClick={toggleTheme}
                type="button"
                className="fixed bottom-6 right-6 p-3 bg-white dark:bg-slate-800 border rounded-full shadow-lg hover:scale-110 transition"
            >
                {dark ? "🌞" : "🌙"}
            </button>
        </div>
    );
}
