import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import type { UserRole } from "../lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  ArrowLeft,
  Building2,
  Package,
  ClipboardCheck,
  Check,
  Loader2,
  Sprout,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import logo from "../assets/public/logo1.png";

// ─── Constants & Types ────────────────────────────────────────────────────────

type AuthView = "login" | "register";

const VARIANTS = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

const ROLES: {
  role: UserRole;
  icon: React.ElementType;
  title: string;
  description: string;
}[] = [
  {
    role: "owner",
    icon: Building2,
    title: "Warehouse Owner",
    description: "Manage multiple sites & view analytics",
  },
  {
    role: "manager",
    icon: Package,
    title: "Warehouse Manager",
    description: "Control inventory & monitor sensors",
  },
  {
    role: "qc_rep",
    icon: ClipboardCheck,
    title: "QC Representative",
    description: "Handle inspections & quality checks",
  },
];

// ─── UI Components ────────────────────────────────────────────────────────────

const InputField = ({
  icon: Icon,
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  icon: React.ElementType;
  error?: string;
}) => (
  <div className="space-y-1">
    <label className="block text-sm font-medium text-gray-700 ml-1">
      {props.placeholder}
    </label>
    <div className="relative group">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#48A111] transition-colors">
        <Icon size={18} />
      </div>
      <input
        className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 bg-gray-50/50 outline-none transition-all duration-200 focus:bg-white
          ${
            error
              ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
              : "border-gray-100 focus:border-[#48A111] focus:ring-4 focus:ring-[#48A111]/10"
          }
        `}
        {...props}
        placeholder=""
      />
    </div>
    {error && (
      <motion.p
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xs text-red-500 ml-1 font-medium"
      >
        {error}
      </motion.p>
    )}
  </div>
);

const RoleCard = ({
  item,
  selected,
  onClick,
}: {
  item: (typeof ROLES)[0];
  selected: boolean;
  onClick: () => void;
}) => {
  const Icon = item.icon;
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`relative w-full p-4 rounded-xl text-left border-2 transition-all duration-200 flex flex-col gap-3 group
        ${
          selected
            ? `border-[#48A111] bg-[#48A111]/5 shadow-sm`
            : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
        }
      `}
    >
      <div className="flex justify-between items-start w-full">
        <div
          className={`p-2.5 rounded-lg transition-colors ${selected ? "bg-[#48A111] text-white" : "bg-gray-100 text-gray-500 group-hover:bg-white"}`}
        >
          <Icon size={20} />
        </div>
        {selected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-5 h-5 bg-[#48A111] rounded-full flex items-center justify-center text-white"
          >
            <Check size={12} strokeWidth={3} />
          </motion.div>
        )}
      </div>

      <div>
        <h3
          className={`font-bold transition-colors ${selected ? "text-[#25671E]" : "text-gray-900"}`}
        >
          {item.title}
        </h3>
        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
          {item.description}
        </p>
      </div>
    </motion.button>
  );
};

// ─── Main Page Component ──────────────────────────────────────────────────────

const AuthPage: React.FC = () => {
  const {
    login,
    register,
    error,
    clearError,
    roleRedirectPath,
    isAuthenticated,
  } = useAuthContext();
  const navigate = useNavigate();
  // Location is unused but often useful for redirects, keeping for now
  // const location = useLocation();

  // State
  const [view, setView] = useState<AuthView>("login");
  const [step, setStep] = useState<1 | 2>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState("");

  // Redirect to dashboard when authenticated (after successful login/register)
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate(roleRedirectPath(), { replace: true });
    }
  }, [isAuthenticated, navigate, roleRedirectPath]);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "manager" as UserRole,
  });

  // Switch views
  const switchView = (v: AuthView) => {
    setView(v);
    setStep(1);
    clearError();
    setLocalError("");
    setFormData((prev) => ({ ...prev, password: "", confirmPassword: "" }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (localError) setLocalError("");
  };

  const validateStep1 = () => {
    if (!formData.name.trim()) return "Full name is required";
    if (!formData.email.trim()) return "Email is required";
    if (formData.password.length < 6)
      return "Password must be at least 6 characters";
    if (formData.password !== formData.confirmPassword)
      return "Passwords do not match";
    return null;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLocalError("");
    clearError();

    try {
      await login(formData.email, formData.password);
      // Navigation handled by useEffect when isAuthenticated becomes true
    } catch (err: any) {
      // Error is handled by context, but we catch here to stop loading
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    setIsLoading(true);
    setLocalError("");
    clearError();

    try {
      await register(
        formData.name,
        formData.email,
        formData.password,
        formData.role,
      );
      // Navigation handled by useEffect when isAuthenticated becomes true
    } catch (err: any) {
      // handled by context
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen w-full flex bg-white font-sans text-slate-800">
      {/* Left Panel - Branding (Hidden on mobile) */}
      <div className="hidden lg:flex flex-col w-1/2 bg-[#0B2211] relative overflow-hidden p-12 text-white justify-between">
        {/* Background Patterns */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#48A111]/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#25671E]/30 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4"></div>
          {/* Grid Pattern Overlay */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        </div>

        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt="Godam Solutions"
              className="h-32 w-auto drop-shadow-lg"
            />
          </div>
        </div>

        <div className="relative z-10 space-y-8 max-w-lg">
          <h1 className="text-5xl font-extrabold leading-tight">
            Smart Storage <br />
            <span className="text-[#48A111]">Simpler Future.</span>
          </h1>
          <p className="text-lg text-gray-300 leading-relaxed">
            Revolutionize your agricultural storage with AI-driven insights,
            real-time monitoring, and seamless inventory management.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
              <ShieldCheck className="text-[#48A111] mb-2" size={24} />
              <h3 className="font-bold">Secure Data</h3>
              <p className="text-sm text-gray-400">
                Enterprise-grade security for your peace of mind.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
              <TrendingUp className="text-[#48A111] mb-2" size={24} />
              <h3 className="font-bold">Real-time Analytics</h3>
              <p className="text-sm text-gray-400">
                Track performance metrics as they happen.
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-2 text-sm text-gray-400">
          <span>© 2024 Godam Solutions. Found a bug?</span>
          <button className="text-white hover:underline decoration-[#48A111] underline-offset-4">
            Report it here.
          </button>
        </div>
      </div>

      {/* Right Panel - Auth Forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative overflow-y-auto">
        <div className="w-full max-w-md space-y-8">
          {/* Header Mobile Only */}
          <div className="lg:hidden flex justify-center mb-10 w-full">
            <img
              src={logo}
              alt="Logo"
              className="h-28 w-auto object-contain drop-shadow-md"
            />
          </div>

          <AnimatePresence mode="wait">
            {/* LOGIN VIEW */}
            {view === "login" && (
              <motion.div
                key="login"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={VARIANTS}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-bold text-slate-900">
                    Welcome back!
                  </h2>
                  <p className="text-slate-500">
                    Enter your credentials to access your account.
                  </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                  {(error || localError) && (
                    <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2 border border-red-100">
                      <span className="font-bold">!</span> {error || localError}
                    </div>
                  )}

                  <InputField
                    name="email"
                    type="email"
                    placeholder="Email address"
                    icon={Mail}
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />

                  <div className="space-y-1">
                    <InputField
                      name="password"
                      type="password"
                      placeholder="Password"
                      icon={Lock}
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                    />
                    <div className="flex justify-end">
                      <button
                        type="button"
                        className="text-xs font-semibold text-[#48A111] hover:text-[#25671E] mt-1"
                      >
                        Forgot password?
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#25671E] hover:bg-[#1e5318] text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-[#25671E]/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      "Sign In"
                    )}
                    {!isLoading && <ArrowRight size={18} />}
                  </button>
                </form>

                <div className="text-center text-sm text-slate-500">
                  Don't have an account?{" "}
                  <button
                    onClick={() => switchView("register")}
                    className="text-[#48A111] font-bold hover:underline"
                  >
                    Create free account
                  </button>
                </div>
              </motion.div>
            )}

            {/* REGISTER VIEW - STEP 1 */}
            {view === "register" && step === 1 && (
              <motion.div
                key="register-step1"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={VARIANTS}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-bold text-slate-900">
                    Create account
                  </h2>
                  <p className="text-slate-500">
                    Join us to manage your warehouse efficiently.
                  </p>
                </div>

                <div className="space-y-4">
                  {(localError || error) && (
                    <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                      {localError || error}
                    </div>
                  )}

                  <InputField
                    name="name"
                    type="text"
                    placeholder="Full Name"
                    icon={User}
                    value={formData.name}
                    onChange={handleInputChange}
                  />

                  <InputField
                    name="email"
                    type="email"
                    placeholder="Email Address"
                    icon={Mail}
                    value={formData.email}
                    onChange={handleInputChange}
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <InputField
                      name="password"
                      type="password"
                      placeholder="Password"
                      icon={Lock}
                      value={formData.password}
                      onChange={handleInputChange}
                    />
                    <InputField
                      name="confirmPassword"
                      type="password"
                      placeholder="Confirm"
                      icon={Lock}
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                    />
                  </div>

                  <button
                    onClick={() => {
                      const err = validateStep1();
                      if (err) setLocalError(err);
                      else setStep(2);
                    }}
                    className="w-full bg-[#25671E] hover:bg-[#1e5318] text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-[#25671E]/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    Next Step <ArrowRight size={18} />
                  </button>
                </div>

                <div className="text-center text-sm text-slate-500">
                  Already have an account?{" "}
                  <button
                    onClick={() => switchView("login")}
                    className="text-[#48A111] font-bold hover:underline"
                  >
                    Sign in here
                  </button>
                </div>
              </motion.div>
            )}

            {/* REGISTER VIEW - STEP 2 */}
            {view === "register" && step === 2 && (
              <motion.div
                key="register-step2"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={VARIANTS}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors mb-2"
                >
                  <ArrowLeft size={16} /> Back to details
                </button>

                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-bold text-slate-900">
                    Select Role
                  </h2>
                  <p className="text-slate-500">
                    Choose the account type that suits you best.
                  </p>
                </div>

                <div className="grid gap-3">
                  {ROLES.map((roleItem) => (
                    <RoleCard
                      key={roleItem.role}
                      item={roleItem}
                      selected={formData.role === roleItem.role}
                      onClick={() =>
                        setFormData({ ...formData, role: roleItem.role })
                      }
                    />
                  ))}
                </div>

                <button
                  onClick={handleRegister}
                  disabled={isLoading}
                  className="w-full bg-[#48A111] hover:bg-[#3d8b0e] text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-[#48A111]/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    "Create Account"
                  )}
                  {!isLoading && <Check size={18} />}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
