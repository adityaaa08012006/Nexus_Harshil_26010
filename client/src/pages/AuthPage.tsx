import React, { useState } from "react";
import { useNavigate, Navigate, useSearchParams } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import type { UserRole } from "../lib/supabase";
import logo from "../assets/logo.png";

// ─── Role Selection Card ──────────────────────────────────────────────────────

interface RoleCardProps {
  role: UserRole;
  selected: boolean;
  onSelect: () => void;
  icon: string;
  title: string;
  description: string;
}

const RoleCard: React.FC<RoleCardProps> = ({
  selected,
  onSelect,
  icon,
  title,
  description,
}) => (
  <button
    type="button"
    onClick={onSelect}
    className="relative w-full aspect-square text-left rounded-xl p-4 border-2 transition-all duration-200 focus:outline-none flex flex-col items-center justify-center"
    style={{
      borderColor: selected ? "#48A111" : "rgba(37,103,30,0.15)",
      backgroundColor: selected ? "rgba(72,161,17,0.07)" : "#fff",
    }}
  >
    {selected && (
      <span
        className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
        style={{ backgroundColor: "#48A111" }}
      >
        ✓
      </span>
    )}
    <span className="block text-3xl mb-2">{icon}</span>
    <span className="block text-sm font-bold text-center" style={{ color: "#25671E" }}>
      {title}
    </span>
    <span
      className="block text-xs mt-1 text-center"
      style={{ color: "rgba(37,103,30,0.6)" }}
    >
      {description}
    </span>
  </button>
);

// ─── Shared Input ─────────────────────────────────────────────────────────────

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
}

const Field: React.FC<FieldProps> = ({ label, id, ...rest }) => (
  <div className="flex flex-col gap-1.5">
    <label
      htmlFor={id}
      className="text-sm font-medium"
      style={{ color: "#25671E" }}
    >
      {label}
    </label>
    <input
      id={id}
      className="w-full px-4 py-2.5 rounded-lg text-sm outline-none border transition-all duration-200 focus:ring-2"
      style={{
        borderColor: "rgba(37,103,30,0.2)",
        color: "#25671E",
        backgroundColor: "#fff",
      }}
      onFocus={(e) => (e.currentTarget.style.borderColor = "#48A111")}
      onBlur={(e) =>
        (e.currentTarget.style.borderColor = "rgba(37,103,30,0.2)")
      }
      {...rest}
    />
  </div>
);

// ─── Login Form ───────────────────────────────────────────────────────────────

const LoginForm: React.FC<{ onSwitch: () => void }> = ({ onSwitch }) => {
  const { login, error, clearError, roleRedirectPath } = useAuthContext();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("[LoginForm] Submit triggered", { email, password: "***" });
    clearError();
    setIsSubmitting(true);
    try {
      console.log("[LoginForm] Calling login function...");
      await login(email, password);
      console.log("[LoginForm] Login successful, navigating...");
      navigate(roleRedirectPath(), { replace: true });
    } catch (err) {
      console.error("[LoginForm] Login error:", err);
      // error shown via context
    } finally {
      setIsSubmitting(false);
      console.log("[LoginForm] Submit completed");
    }
  };

  // Only disable during submission, not during auth context's initial load
  const isDisabled = isSubmitting;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <h2 className="text-2xl font-extrabold" style={{ color: "#25671E" }}>
          Welcome back
        </h2>
        <p className="text-sm mt-1" style={{ color: "rgba(37,103,30,0.6)" }}>
          Sign in to your Godam Solutions account
        </p>
      </div>

      {error && (
        <div
          className="px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2"
          style={{ backgroundColor: "#FEE2E2", color: "#DC2626" }}
        >
          <span>⚠️</span> {error}
        </div>
      )}

      <Field
        label="Email address"
        id="login-email"
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        autoComplete="email"
      />

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="login-password"
            className="text-sm font-medium"
            style={{ color: "#25671E" }}
          >
            Password
          </label>
          <button
            type="button"
            className="text-xs font-semibold transition-colors"
            style={{ color: "#48A111" }}
          >
            Forgot password?
          </button>
        </div>
        <div className="relative">
          <input
            id="login-password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="w-full px-4 py-2.5 pr-10 rounded-lg text-sm outline-none border transition-all duration-200 focus:ring-2"
            style={{ borderColor: "rgba(37,103,30,0.2)", color: "#25671E" }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#48A111")}
            onBlur={(e) =>
              (e.currentTarget.style.borderColor = "rgba(37,103,30,0.2)")
            }
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-lg"
            style={{ color: "rgba(37,103,30,0.5)" }}
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={isDisabled}
        className="w-full py-3 rounded-xl text-sm font-bold transition-all duration-200 hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
        style={{ backgroundColor: "#25671E", color: "#F7F0F0" }}
      >
        {isSubmitting ? "Signing in…" : "Sign In →"}
      </button>

      <p
        className="text-center text-sm"
        style={{ color: "rgba(37,103,30,0.6)" }}
      >
        Don&apos;t have an account?{" "}
        <button
          type="button"
          onClick={onSwitch}
          className="font-semibold transition-colors"
          style={{ color: "#48A111" }}
        >
          Create one
        </button>
      </p>
    </form>
  );
};

// ─── Register Form ────────────────────────────────────────────────────────────

const ROLES: {
  role: UserRole;
  icon: string;
  title: string;
  description: string;
}[] = [
  {
    role: "owner",
    icon: "🏢",
    title: "Warehouse Owner",
    description: "Multi-warehouse visibility & analytics",
  },
  {
    role: "manager",
    icon: "📦",
    title: "Warehouse Manager",
    description: "Full inventory & sensor control",
  },
  {
    role: "qc_rep",
    icon: "📋",
    title: "QC Representative",
    description: "Order upload & tracking",
  },
];

const RegisterForm: React.FC<{ onSwitch: () => void }> = ({ onSwitch }) => {
  const { register, error, clearError } = useAuthContext();
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [role, setRole] = useState<UserRole>("manager");
  const [localError, setLocalError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    clearError();
    
    // Validate step 1 fields
    if (!name.trim()) {
      setLocalError("Please enter your full name");
      return;
    }
    if (!email.trim()) {
      setLocalError("Please enter your email address");
      return;
    }
    if (password.length < 6) {
      setLocalError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirm) {
      setLocalError("Passwords do not match");
      return;
    }
    
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError("");
    
    setIsSubmitting(true);
    try {
      await register(name, email, password, role);
      // After signup Supabase may send a confirmation email;
      // for demo we navigate immediately
      const path =
        role === "owner"
          ? "/owner/dashboard"
          : role === "manager"
            ? "/manager/dashboard"
            : "/qc/orders";
      navigate(path, { replace: true });
    } catch {
      // shown via context error
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayError = localError || error;
  const isDisabled = isSubmitting;

  // Step 1: Basic Information
  if (step === 1) {
    return (
      <form onSubmit={handleNext} className="flex flex-col gap-4">
        <div>
          <h2 className="text-2xl font-extrabold" style={{ color: "#25671E" }}>
            Create account
          </h2>
          <p className="text-sm mt-1" style={{ color: "rgba(37,103,30,0.6)" }}>
            Join Godam Solutions — let's get started
          </p>
        </div>

        {displayError && (
          <div
            className="px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2"
            style={{ backgroundColor: "#FEE2E2", color: "#DC2626" }}
          >
            <span>⚠️</span> {displayError}
          </div>
        )}

        <Field
          label="Full name"
          id="reg-name"
          type="text"
          placeholder="Ravi Kumar"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Field
          label="Email address"
          id="reg-email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <Field
          label="Password"
          id="reg-password"
          type="password"
          placeholder="Min. 6 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
        />
        <Field
          label="Confirm password"
          id="reg-confirm"
          type="password"
          placeholder="Repeat password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          autoComplete="new-password"
        />

        <button
          type="submit"
          className="w-full py-3 rounded-xl text-sm font-bold transition-all duration-200 hover:opacity-90"
          style={{ backgroundColor: "#25671E", color: "#F7F0F0" }}
        >
          Next →
        </button>

        <p
          className="text-center text-sm"
          style={{ color: "rgba(37,103,30,0.6)" }}
        >
          Already have an account?{" "}
          <button
            type="button"
            onClick={onSwitch}
            className="font-semibold"
            style={{ color: "#48A111" }}
          >
            Sign in
          </button>
        </p>
      </form>
    );
  }

  // Step 2: Role Selection
  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <button
          type="button"
          onClick={() => setStep(1)}
          className="text-sm font-medium mb-3 flex items-center gap-1 transition-colors"
          style={{ color: "#48A111" }}
        >
          ← Back
        </button>
        <h2 className="text-2xl font-extrabold" style={{ color: "#25671E" }}>
          Select your role
        </h2>
        <p className="text-sm mt-1" style={{ color: "rgba(37,103,30,0.6)" }}>
          Choose how you'll use Godam Solutions
        </p>
      </div>

      {displayError && (
        <div
          className="px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2"
          style={{ backgroundColor: "#FEE2E2", color: "#DC2626" }}
        >
          <span>⚠️</span> {displayError}
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        {ROLES.map((r) => (
          <RoleCard
            key={r.role}
            {...r}
            selected={role === r.role}
            onSelect={() => setRole(r.role)}
          />
        ))}
      </div>

      <button
        type="submit"
        disabled={isDisabled}
        className="w-full py-3 rounded-xl text-sm font-bold transition-all duration-200 hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
        style={{ backgroundColor: "#25671E", color: "#F7F0F0" }}
      >
        {isSubmitting ? "Creating account…" : "Create Account →"}
      </button>

      <p
        className="text-center text-sm"
        style={{ color: "rgba(37,103,30,0.6)" }}
      >
        Already have an account?{" "}
        <button
          type="button"
          onClick={onSwitch}
          className="font-semibold"
          style={{ color: "#48A111" }}
        >
          Sign in
        </button>
      </p>
    </form>
  );
};

// ─── Auth Page ────────────────────────────────────────────────────────────────

export const AuthPage: React.FC = () => {
  const { isAuthenticated, isLoading, roleRedirectPath, error, clearError } =
    useAuthContext();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<"login" | "register">(
    searchParams.get("tab") === "register" ? "register" : "login",
  );

  const isNetworkError =
    !!error && (error.includes("Cannot reach") || error.includes("fetch"));

  // Clear errors when switching between login and register
  const switchMode = (newMode: "login" | "register") => {
    clearError();
    setMode(newMode);
  };

  // Already logged in → redirect to dashboard
  if (!isLoading && isAuthenticated) {
    return <Navigate to={roleRedirectPath()} replace />;
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#F7F0F0" }}>
      {/* ── Left Panel (hidden on mobile) ── */}
      <div
        className="hidden lg:flex lg:w-1/2 xl:w-[55%] flex-col items-center justify-center p-12 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(140deg, #1a3a10 0%, #25671E 50%, #48A111 100%)",
        }}
      >
        {/* Decorative circles */}
        <div
          className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10"
          style={{
            backgroundColor: "#F2B50B",
            transform: "translate(30%, -30%)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-72 h-72 rounded-full opacity-10"
          style={{
            backgroundColor: "#48A111",
            transform: "translate(-30%, 30%)",
          }}
        />

        {/* Centered Content */}
        <div className="z-10 text-center">
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <img 
              src={logo} 
              alt="Godam AI" 
              className="h-32 w-auto object-contain drop-shadow-2xl"
            />
          </div>
          
          {/* Godam AI Title */}
          <h1
            className="text-5xl xl:text-6xl font-bold mb-6"
            style={{ color: "#F7F0F0" }}
          >
            Godam AI
          </h1>
          
          {/* Impactful Tagline */}
          <p
            className="text-2xl xl:text-3xl font-light leading-relaxed"
            style={{ color: "#F2B50B" }}
          >
            Transforming Warehouses<br />with Intelligence
          </p>
        </div>
      </div>

      {/* ── Right Panel (form) ── */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-10 md:px-16 lg:px-12 xl:px-20">
        {/* Mobile logo */}
        <div className="flex items-center justify-center mb-10 lg:hidden">
          <img src={logo} alt="Godam AI" className="h-14 w-auto" />
        </div>

        {/* Tab switcher */}
        <div
          className="flex rounded-xl p-1 mb-8 self-start gap-1"
          style={{ backgroundColor: "rgba(37,103,30,0.08)" }}
        >
          {(["login", "register"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => switchMode(t)}
              className="px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
              style={{
                backgroundColor: mode === t ? "#25671E" : "transparent",
                color: mode === t ? "#F7F0F0" : "rgba(37,103,30,0.6)",
              }}
            >
              {t === "login" ? "Sign In" : "Register"}
            </button>
          ))}
        </div>

        {/* Connection error banner */}
        {isNetworkError && (
          <div
            className="w-full max-w-md mb-4 px-4 py-3 rounded-xl text-sm font-medium flex items-start gap-3"
            style={{
              backgroundColor: "#FEF3C7",
              color: "#92400E",
              border: "1px solid #F59E0B",
            }}
          >
            <span className="text-lg">⚠️</span>
            <div>
              <p className="font-bold mb-0.5">Supabase unreachable</p>
              <p>{error}</p>
              <button
                onClick={() => {
                  clearError();
                  window.location.reload();
                }}
                className="mt-2 text-xs font-semibold underline"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Form card */}
        <div
          className="w-full max-w-md rounded-2xl p-8 shadow-xl"
          style={{
            backgroundColor: "#fff",
            border: "1.5px solid rgba(37,103,30,0.08)",
          }}
        >
          {mode === "login" ? (
            <LoginForm onSwitch={() => switchMode("register")} />
          ) : (
            <RegisterForm onSwitch={() => switchMode("login")} />
          )}
        </div>

        {/* Back to home */}
        <a
          href="/"
          className="mt-6 self-start flex items-center gap-1.5 text-sm font-medium transition-colors"
          style={{ color: "rgba(37,103,30,0.55)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#25671E")}
          onMouseLeave={(e) =>
            (e.currentTarget.style.color = "rgba(37,103,30,0.55)")
          }
        >
          ← Back to home
        </a>
      </div>
    </div>
  );
};
