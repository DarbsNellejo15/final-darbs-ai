import React, { useState } from "react";
import {
  Lock,
  Mail,
  User,
  Shield,
  Eye,
  EyeOff,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { UserProfile } from "../types";

interface StoredAccount {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  createdAt: string;
}

const DEFAULT_ACCOUNTS: StoredAccount[] = [
  {
    id: "tech-user-01",
    name: "Hardware Technician",
    email: "tech@darbs.io",
    password: "password123",
    role: "Hardware & Laptop Technician",
    createdAt: new Date().toISOString(),
  },
];

const getRegisteredAccounts = (): StoredAccount[] => {
  try {
    const raw = localStorage.getItem("darbs_registered_accounts");
    if (!raw) {
      localStorage.setItem("darbs_registered_accounts", JSON.stringify(DEFAULT_ACCOUNTS));
      return DEFAULT_ACCOUNTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return DEFAULT_ACCOUNTS;
  } catch {
    return DEFAULT_ACCOUNTS;
  }
};

interface LoginPortalProps {
  onLogin: (user: UserProfile) => void;
}

export const LoginPortal: React.FC<LoginPortalProps> = ({ onLogin }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setPasswordError(false);

    const cleanIdentifier = email.trim();

    if (!cleanIdentifier) {
      setError(isSignUp ? "Please provide a valid technician email address." : "Please enter your User name or Email.");
      return;
    }

    if (isSignUp && !cleanIdentifier.includes("@")) {
      setError("Please provide a valid technician email address.");
      return;
    }

    if (!password || password.length < 4) {
      setError("Password must contain at least 4 characters.");
      setPasswordError(true);
      return;
    }

    const accounts = getRegisteredAccounts();

    if (isSignUp) {
      // Create / Register Account
      if (!name.trim()) {
        setError("Please enter your User name.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match. Please verify.");
        setPasswordError(true);
        return;
      }

      const existingAccount = accounts.find(
        (acc) => acc.email.toLowerCase() === cleanIdentifier.toLowerCase()
      );
      if (existingAccount) {
        setError("An account with this email is already registered. Please sign in instead.");
        return;
      }

      setIsSubmitting(true);
      setTimeout(() => {
        const newAccount: StoredAccount = {
          id: `tech-${Date.now()}`,
          name: name.trim(),
          email: cleanIdentifier.toLowerCase(),
          password: password,
          role: "Hardware & Laptop Technician",
          createdAt: new Date().toISOString(),
        };

        const updated = [...accounts, newAccount];
        localStorage.setItem("darbs_registered_accounts", JSON.stringify(updated));

        const authenticatedUser: UserProfile = {
          id: newAccount.id,
          name: newAccount.name,
          email: newAccount.email,
          role: newAccount.role,
          createdAt: newAccount.createdAt,
        };

        localStorage.setItem("darbs_auth_user", JSON.stringify(authenticatedUser));
        sessionStorage.setItem("darbs_auth_user", JSON.stringify(authenticatedUser));

        setSuccessMessage("Account registered successfully! Opening DARBS...");
        setTimeout(() => {
          onLogin(authenticatedUser);
        }, 500);
      }, 400);
    } else {
      // Strict Login Verification against Registered Accounts (Username or Email)
      setIsSubmitting(true);
      setTimeout(() => {
        const cleanLower = cleanIdentifier.toLowerCase();
        const found = accounts.find(
          (acc) =>
            acc.email.toLowerCase() === cleanLower ||
            acc.name.toLowerCase() === cleanLower
        );

        if (!found) {
          setError("Account not found. Access is restricted to registered accounts only. Please create an account first.");
          setPasswordError(false);
          setIsSubmitting(false);
          return;
        }

        if (found.password !== password) {
          setError("Incorrect password! Access denied. DARBS cannot open with invalid credentials.");
          setPasswordError(true);
          setIsSubmitting(false);
          return;
        }

        // Both credentials and password match registered account
        setPasswordError(false);
        const authenticatedUser: UserProfile = {
          id: found.id,
          name: found.name,
          email: found.email,
          role: found.role || "Hardware & Laptop Technician",
          createdAt: found.createdAt,
        };

        localStorage.setItem("darbs_auth_user", JSON.stringify(authenticatedUser));
        sessionStorage.setItem("darbs_auth_user", JSON.stringify(authenticatedUser));

        setSuccessMessage("Credentials verified. Opening DARBS...");
        setTimeout(() => {
          onLogin(authenticatedUser);
        }, 350);
      }, 450);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#070e1b] px-4 py-8 text-slate-100">
      {/* Background Tech Grid & Glow Accents */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-cyan-600/15 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-blue-600/15 blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-slate-900/60 blur-[100px]" />
        
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #38bdf8 1px, transparent 0)`,
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      {/* Main Auth Container */}
      <div className="relative z-10 w-full max-w-md animate-in fade-in zoom-in-95 duration-300">
        <div className="rounded-3xl border border-slate-800 bg-[#0a1224]/90 p-6 md:p-8 shadow-2xl backdrop-blur-xl">
          {/* Header Brand */}
          <div className="text-center">
            <div className="mx-auto mb-4 relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-xl shadow-cyan-500/25 ring-2 ring-cyan-400/50 overflow-hidden">
              <img
                src="/src/assets/images/darbs_logo_1791717510434.jpg"
                alt="DARBS Logo"
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
              />
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-[#0a1224] z-10">
                <Shield className="h-2.5 w-2.5 text-white" />
              </span>
            </div>

            <div className="flex items-center justify-center gap-2">
              <h1 className="text-2xl font-black tracking-wider text-white">DARBS</h1>
            </div>
            
            <p className="mt-1 text-xs text-slate-400">
              Diagnostic Assistant for Repair, Bugs and Support
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="mt-6 flex rounded-xl border border-slate-800 bg-slate-950/70 p-1">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(false);
                setError(null);
              }}
              className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all ${
                !isSignUp
                  ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/20"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(true);
                setError(null);
              }}
              className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all ${
                isSignUp
                  ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/20"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Success Banner */}
          {successMessage && (
            <div className="mt-4 rounded-xl border border-emerald-500/40 bg-emerald-950/40 p-3 text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="mt-4 rounded-xl border border-red-500/50 bg-red-950/50 p-3 text-xs text-red-200 flex items-center gap-2 animate-in fade-in">
              <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Auth Form */}
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {/* Name field (Sign Up only) */}
            {isSignUp && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  User name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (error) setError(null);
                    }}
                    required={isSignUp}
                    className="w-full rounded-xl border border-slate-800 bg-slate-900/90 py-2.5 pl-10 pr-3.5 text-xs md:text-sm text-slate-100 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                  />
                </div>
              </div>
            )}

            {/* User name / Email Address */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                {isSignUp ? "Email" : "User name"}
              </label>
              <div className="relative">
                {isSignUp ? (
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                ) : (
                  <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                )}
                <input
                  type={isSignUp ? "email" : "text"}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  required
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/90 py-2.5 pl-10 pr-3.5 text-xs md:text-sm text-slate-100 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                  Password
                </label>
                {passwordError && (
                  <span className="text-[10px] text-red-400 font-medium animate-pulse">
                    Password incorrect
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock
                  className={`absolute left-3.5 top-3 h-4 w-4 transition-colors ${
                    passwordError ? "text-red-400" : "text-slate-400"
                  }`}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) setPasswordError(false);
                    if (error) setError(null);
                  }}
                  required
                  className={`w-full rounded-xl border py-2.5 pl-10 pr-10 text-xs md:text-sm text-slate-100 transition-all ${
                    passwordError
                      ? "border-red-500/90 bg-red-950/20 ring-1 ring-red-500/50 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                      : "border-slate-800 bg-slate-900/90 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password (Sign Up only) */}
            {isSignUp && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (error) setError(null);
                    }}
                    required={isSignUp}
                    className="w-full rounded-xl border border-slate-800 bg-slate-900/90 py-2.5 pl-10 pr-3.5 text-xs md:text-sm text-slate-100 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 py-3 px-4 text-xs md:text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 hover:from-cyan-500 hover:to-blue-500 transition-all disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>{isSignUp ? "Register Account" : "Log In"}</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
