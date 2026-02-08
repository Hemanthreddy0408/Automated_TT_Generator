
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { ArrowRight, CheckCircle2, Quote, Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

// Schema for login validation
const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email" }),
  password: z.string().min(1, { message: "Required" }),
});

const quotes = [
  {
    text: "Your time is limited, so don't waste it living someone else's life."
  },
  {
    text: "Better three hours too soon than a minute too late."
  },
  {
    text: "The key is in not spending time, but in investing it."
  }
];

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roleParam = searchParams.get("role"); // "admin" or "faculty"
  const { theme, setTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  // Auto-scroll quotes
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Login Logic
  const handleLogin = async (values: z.infer<typeof loginSchema>, role: "admin" | "faculty") => {
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      console.log(`Logging in as ${role}`, values);

      // Mock Success
      toast.success("Welcome back", {
        description: "Successfully signed in.",
      });

      if (role === "admin") {
        navigate("/admin");
      } else {
        navigate("/faculty");
      }
    }, 1500);
  };

  return (
    <div className="w-full h-screen flex overflow-hidden bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* LEFT PANEL - FORM */}
      <div className="w-full lg:w-[480px] xl:w-[550px] flex flex-col justify-center p-8 lg:p-12 xl:p-16 relative z-10 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 shadow-2xl transition-colors duration-300">
        <div className="max-w-[360px] mx-auto w-full space-y-8 animate-in slide-in-from-left-8 fade-in duration-700">

          {/* Header with Theme Toggle */}
          <div className="flex justify-between items-start">
            <div>
              <Link to="/">
                <Button variant="link" className="pl-0 h-auto p-0 text-slate-500 dark:text-slate-400 mb-4 hover:text-indigo-600 dark:hover:text-violet-400">
                  <ArrowRight className="w-4 h-4 mr-2 rotate-180" /> Back to Home
                </Button>
              </Link>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">UniTT</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-2">Sign in to continue.</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>

          {/* Conditional Rendering based on URL param */}
          {roleParam ? (
            <div className="w-full">
              <div className="bg-slate-100 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-200 dark:border-slate-800 mb-6 text-center">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {roleParam === 'admin' ? 'Administrator Access' : 'Faculty Access'}
                </span>
              </div>
              <LoginForm
                role={roleParam as "admin" | "faculty"}
                onSubmit={(values) => handleLogin(values, roleParam as "admin" | "faculty")}
                isLoading={isLoading}
              />
              <div className="mt-4 text-center">
                <Link to="/login" className="text-xs text-slate-500 hover:text-indigo-600 dark:hover:text-violet-400 transition-colors">
                  Not {roleParam === 'admin' ? 'an admin' : 'a faculty member'}? Switch account type
                </Link>
              </div>
            </div>
          ) : (
            <Tabs defaultValue="faculty" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8 bg-slate-100 dark:bg-slate-900/50 p-1 h-11 rounded-lg border border-transparent dark:border-slate-800 transition-colors">
                <TabsTrigger value="faculty" className="rounded-md font-medium text-sm transition-all text-slate-600 dark:text-slate-400 data-[state=active]:bg-white dark:data-[state=active]:bg-violet-600 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-white data-[state=active]:shadow-sm dark:data-[state=active]:shadow-lg dark:shadow-violet-500/20">Faculty</TabsTrigger>
                <TabsTrigger value="admin" className="rounded-md font-medium text-sm transition-all text-slate-600 dark:text-slate-400 data-[state=active]:bg-white dark:data-[state=active]:bg-violet-600 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-white data-[state=active]:shadow-sm dark:data-[state=active]:shadow-lg dark:shadow-violet-500/20">Admin</TabsTrigger>
              </TabsList>

              <TabsContent value="faculty" className="mt-0 focus-visible:outline-none">
                <LoginForm role="faculty" onSubmit={(values) => handleLogin(values, "faculty")} isLoading={isLoading} />
              </TabsContent>

              <TabsContent value="admin" className="mt-0 focus-visible:outline-none">
                <LoginForm role="admin" onSubmit={(values) => handleLogin(values, "admin")} isLoading={isLoading} />
              </TabsContent>
            </Tabs>
          )}

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 transition-colors">
            <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
              <span>© 2024 UniTT Systems</span>
              <a href="#" className="hover:text-indigo-600 dark:hover:text-violet-400 transition-colors">Help & Support</a>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL - PURE ART */}
      <div className="hidden lg:block flex-1 relative bg-slate-50 dark:bg-slate-950 overflow-hidden transition-colors duration-300">
        {/* Modern Dynamic Gradient Art */}
        <div className="absolute inset-0 bg-[conic-gradient(at_bottom_left,_var(--tw-gradient-stops))] from-indigo-200 via-slate-100 to-indigo-50 dark:from-slate-900 dark:via-slate-950 dark:to-violet-950/20 transition-colors duration-500"></div>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/10 dark:bg-violet-600/10 rounded-full blur-[120px] animate-pulse transition-colors duration-500"></div>
        <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-blue-400/10 dark:bg-indigo-600/10 rounded-full blur-[100px] transition-colors duration-500"></div>

        {/* Floating UI Elements (With Scrolling Quotes) */}
        <div className="absolute inset-0 flex items-center justify-center opacity-90 dark:opacity-100">
          <div className="relative w-[500px] h-[340px] bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 dark:border-white/5 p-8 transform -rotate-2 hover:rotate-0 transition-all duration-700 ease-out flex flex-col justify-center dark:ring-1 dark:ring-white/10">

            <Quote className="w-10 h-10 text-indigo-600 dark:text-violet-500 mb-6 opacity-50 dark:opacity-80 transition-colors" />

            <div className="h-40 relative">
              {quotes.map((quote, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-all duration-1000 ease-in-out ${index === currentQuoteIndex
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4"
                    }`}
                >
                  <p className="text-xl font-medium text-slate-800 dark:text-slate-200 leading-relaxed italic transition-colors">
                    "{quote.text}"
                  </p>

                </div>
              ))}
            </div>

            {/* Indicators */}
            <div className="absolute bottom-8 right-8 flex gap-2">
              {quotes.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-500 ${idx === currentQuoteIndex
                    ? "w-6 bg-indigo-600 dark:bg-violet-500 dark:shadow-[0_0_10px_rgba(139,92,246,0.5)]"
                    : "w-1.5 bg-indigo-200 dark:bg-slate-700"
                    }`}
                />
              ))}
            </div>

            {/* Floating Badge */}
            <div className="absolute -right-6 -top-6 bg-white dark:bg-slate-900 p-3 rounded-xl shadow-lg dark:shadow-xl border border-slate-100 dark:border-white/10 animate-bounce transition-colors">
              <CheckCircle2 className="w-6 h-6 text-emerald-500 dark:text-emerald-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Reusable Login Form Component
interface LoginFormProps {
  role: "admin" | "faculty";
  onSubmit: (values: z.infer<typeof loginSchema>) => void;
  isLoading: boolean;
}

const LoginForm = ({ role, onSubmit, isLoading }: LoginFormProps) => {
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 transition-colors">Email</FormLabel>
              <FormControl>
                <Input
                  placeholder={role === "admin" ? "admin@unitt.edu" : "faculty@unitt.edu"}
                  {...field}
                  className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-violet-500/20 focus:border-indigo-400 dark:focus:border-violet-500 h-11 transition-all"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 transition-colors">Password</FormLabel>
                <a href="#" className="text-xs text-indigo-600 dark:text-violet-400 hover:text-indigo-500 dark:hover:text-violet-300 font-medium transition-colors">
                  Forgot Password?
                </a>
              </div>
              <FormControl>
                <Input
                  type="password"
                  placeholder="••••••••"
                  {...field}
                  className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-violet-500/20 focus:border-indigo-400 dark:focus:border-violet-500 h-11 transition-all"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className="w-full bg-slate-900 hover:bg-indigo-600 dark:bg-gradient-to-r dark:from-violet-600 dark:to-indigo-600 dark:hover:from-violet-500 dark:hover:to-indigo-500 text-white h-11 rounded-lg font-medium transition-all group mt-2 dark:shadow-lg dark:shadow-violet-900/20 dark:border dark:border-white/5" type="submit" disabled={isLoading}>
          {isLoading ? "Signing in..." : (
            <span className="flex items-center justify-center gap-2">
              Sign In <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          )}
        </Button>
        <div className="text-center mt-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Don't have an account?{" "}
            <Link to="/register" className="text-indigo-600 dark:text-violet-400 hover:underline font-medium transition-colors">
              create new account
            </Link>
          </p>
        </div>
      </form>
    </Form>
  );
};

export default Login;
