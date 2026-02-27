import React, { useState } from "react";
import { useNavigate, Navigate, useSearchParams } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import type { UserRole } from "../lib/supabase";

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
    className="relative w-full text-left rounded-xl p-4 border-2 transition-all duration-200 focus:outline-none"
    style={{
      borderColor: selected ? "#48A111" : "rgba(37,103,30,0.15)",
      backgroundColor: selected ? "rgba(72,161,17,0.07)" : "#fff",
    }}
  >
    {selected && (
      <span
        className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
        style={{ backgroundColor: "#48A111" }}
      >
        ✓
      </span>
    )}
    <span className="block text-2xl mb-1">{icon}</span>
    <span className="block text-sm font-bold" style={{ color: "#25671E" }}>
      {title}
    </span>
    <span
      className="block text-xs mt-0.5"
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
  const { login, error, clearError, isLoading, roleRedirectPath } =
    useAuthContext();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await login(email, password);
      navigate(roleRedirectPath(), { replace: true });
    } catch {
      // error shown via context
    }
  };

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
        disabled={isLoading}
        className="w-full py-3 rounded-xl text-sm font-bold transition-all duration-200 hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
        style={{ backgroundColor: "#25671E", color: "#F7F0F0" }}
      >
        {isLoading ? "Signing in…" : "Sign In →"}
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
  const { register, error, clearError, isLoading } = useAuthContext();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [role, setRole] = useState<UserRole>("manager");
  const [localError, setLocalError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError("");
    if (password !== confirm) {
      setLocalError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setLocalError("Password must be at least 6 characters");
      return;
    }
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
    }
  };

  const displayError = localError || error;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <h2 className="text-2xl font-extrabold" style={{ color: "#25671E" }}>
          Create account
        </h2>
        <p className="text-sm mt-1" style={{ color: "rgba(37,103,30,0.6)" }}>
          Join Godam Solutions — choose your role below
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

      <div>
        <p className="text-sm font-medium mb-2" style={{ color: "#25671E" }}>
          Select your role
        </p>
        <div className="grid grid-cols-3 gap-2">
          {ROLES.map((r) => (
            <RoleCard
              key={r.role}
              {...r}
              selected={role === r.role}
              onSelect={() => setRole(r.role)}
            />
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 rounded-xl text-sm font-bold transition-all duration-200 hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
        style={{ backgroundColor: "#25671E", color: "#F7F0F0" }}
      >
        {isLoading ? "Creating account…" : "Create Account →"}
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

  // Already logged in → redirect to dashboard
  if (!isLoading && isAuthenticated) {
    return <Navigate to={roleRedirectPath()} replace />;
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#F7F0F0" }}>
      {/* ── Left Panel (hidden on mobile) ── */}
      <div
        className="hidden lg:flex lg:w-1/2 xl:w-[55%] flex-col justify-between p-12 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(140deg, #1a3a10 0%, #25671E 50%, #48A111 100%)",
        }}
      >
        {/* Decorative circles */}
        <div
          className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-10"
          style={{
            backgroundColor: "#F2B50B",
            transform: "translate(30%, -30%)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-56 h-56 rounded-full opacity-10"
          style={{
            backgroundColor: "#48A111",
            transform: "translate(-30%, 30%)",
          }}
        />

        {/* Logo */}
        <div className="flex items-center gap-3 z-10">
          <span className="text-3xl">🌾</span>
          <div>
            <span
              className="text-xl font-extrabold"
              style={{ color: "#F7F0F0" }}
            >
              Godam
            </span>
            <span
              className="text-xl font-light ml-1"
              style={{ color: "#F2B50B" }}
            >
              Solutions
            </span>
          </div>
        </div>

        {/* Main content */}
        <div className="z-10">
          <h1
            className="text-4xl xl:text-5xl font-extrabold leading-tight mb-6"
            style={{ color: "#F7F0F0" }}
          >
            Intelligent Post-Harvest{" "}
            <span style={{ color: "#F2B50B" }}>Warehouse</span> Optimization
          </h1>
          <p
            className="text-lg leading-relaxed mb-10"
            style={{ color: "rgba(247,240,240,0.75)" }}
          >
            Real-time spoilage detection, AI-powered allocation, and complete
            batch traceability — from farm gate to market delivery.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-3">
            {[
              "🌡️ Sensor Monitoring",
              "📊 Risk Scoring",
              "🎯 Smart Allocation",
              "🤖 AI Parsing",
              "♻️ Waste Reduction",
            ].map((f) => (
              <span
                key={f}
                className="px-3 py-1.5 rounded-full text-xs font-semibold"
                style={{
                  backgroundColor: "rgba(247,240,240,0.12)",
                  color: "#F7F0F0",
                }}
              >
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* SDG Footer */}
        <div className="z-10 flex items-center gap-3">
          <div className="flex gap-2">
            {["SDG 2 🌱", "SDG 9 🏗", "SDG 12 ♻️"].map((s) => (
              <span
                key={s}
                className="text-xs px-2 py-1 rounded"
                style={{
                  backgroundColor: "rgba(247,240,240,0.1)",
                  color: "rgba(247,240,240,0.65)",
                }}
              >
                {s}
              </span>
            ))}
          </div>
          <span className="text-xs" style={{ color: "rgba(247,240,240,0.4)" }}>
            SDG Aligned
          </span>
        </div>
      </div>

      {/* ── Right Panel (form) ── */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-10 md:px-16 lg:px-12 xl:px-20">
        {/* Mobile logo */}
        <div className="flex items-center gap-2 mb-10 lg:hidden">
          <span className="text-2xl">🌾</span>
          <span className="text-lg font-extrabold" style={{ color: "#25671E" }}>
            Godam
          </span>
          <span className="text-lg font-light" style={{ color: "#48A111" }}>
            Solutions
          </span>
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
              onClick={() => setMode(t)}
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
            <LoginForm onSwitch={() => setMode("register")} />
          ) : (
            <RegisterForm onSwitch={() => setMode("login")} />
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
