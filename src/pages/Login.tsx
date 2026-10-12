// src/pages/auth/Login.tsx
import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  signIn,
  signOut,
  resetPassword,
  confirmResetPassword,
} from "aws-amplify/auth";
import { FileText, Mail, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { parseAuthError } from "../utils/authUtils";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { checkUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const [forgotMode, setForgotMode] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      let signInResult;

      try {
        // Attempt normal sign-in
        signInResult = await signIn({
          username: email.trim(),
          password,
        });
      } catch (authErr: unknown) {
        // Clear conflicting session if already authenticated
        const message = authErr instanceof Error ? authErr.message : "";
        if (
          message.includes("signed in user") ||
          (authErr as { name?: string })?.name === "UserAlreadyAuthenticatedException"
        ) {
          await signOut({ global: true });
          signInResult = await signIn({
            username: email.trim(),
            password,
          });
        } else {
          throw authErr;
        }
      }

      if (signInResult.nextStep.signInStep === "DONE") {
        // Refresh AuthContext with authenticated user
        const currentUser = await checkUser();

        // Redirect based on role
        if (currentUser?.role?.toLowerCase() === "admin") {
          navigate("/admin", { replace: true });
        } else {
          navigate("/dashboard", { replace: true });
        }
      } else {
        setError(`Additional verification step required: ${signInResult.nextStep.signInStep}`);
      }
    } catch (err: unknown) {
      setError(parseAuthError(err, "Login failed."));
    } finally {
      setLoading(false);
    }
  };

  const handleSendCode = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const result = await resetPassword({ username: email.trim() });
      if (result.nextStep.resetPasswordStep === "CONFIRM_RESET_PASSWORD_WITH_CODE") {
        setCodeSent(true);
        setSuccess("A verification code has been sent to your registered email.");
      } else {
        setError("Unexpected reset step. Please try again.");
      }
    } catch (err: unknown) {
      setError(parseAuthError(err, "Could not request password reset."));
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReset = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword.length < 8) {
      setError("Your new password must contain at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      await confirmResetPassword({
        username: email.trim(),
        confirmationCode: confirmationCode.trim(),
        newPassword,
      });

      setForgotMode(false);
      setCodeSent(false);
      setConfirmationCode("");
      setNewPassword("");
      setPassword("");
      setSuccess("Password reset successfully. You can now log in.");
    } catch (err: unknown) {
      setError(parseAuthError(err, "Could not reset password."));
    } finally {
      setLoading(false);
    }
  };

  const openForgotPassword = () => {
    setError("");
    setSuccess("");
    setCodeSent(false);
    setConfirmationCode("");
    setNewPassword("");
    setForgotMode(true);
  };

  const backToLogin = () => {
    setForgotMode(false);
    setCodeSent(false);
    setConfirmationCode("");
    setNewPassword("");
    setError("");
    setSuccess("");
  };

  return (
    <div className="min-h-screen bg-[#e5e5e5] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-16 h-16 bg-[#14213d] text-[#fca311] rounded-2xl shadow-lg border border-[#14213d]/20 mb-4 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <FileText size={32} />
          </div>
          <h1
            className="text-3xl font-extrabold text-[#14213d] tracking-tight cursor-pointer"
            onClick={() => navigate("/")}
          >
            DocVault
          </h1>
          <p className="text-[#14213d]/70 text-sm mt-1 font-medium">
            College Digital Document Vault
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-white rounded-2xl shadow-xl border border-[#14213d]/10 p-8">
          <h2 className="text-2xl font-extrabold text-[#14213d]">
            {forgotMode
              ? codeSent
                ? "Reset Your Password"
                : "Forgot Password?"
              : "Welcome Back"}
          </h2>

          <p className="text-[#14213d]/60 text-sm mt-1 mb-6">
            {forgotMode
              ? codeSent
                ? "Enter the verification code and choose a new password."
                : "Enter your registered email to request a reset code."
              : "Login to access your documents"}
          </p>

          {error && (
            <div role="alert" className="mb-5 rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-xs font-semibold text-rose-700">
              {error}
            </div>
          )}

          {success && (
            <div role="status" className="mb-5 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-xs font-semibold text-emerald-800">
              {success}
            </div>
          )}

          {forgotMode ? (
            !codeSent ? (
              <form onSubmit={handleSendCode} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#14213d]/80 mb-2">
                    Registered Email Address
                  </label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#14213d]/40" />
                    <input
                      type="email"
                      placeholder="Enter your registered email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 text-sm bg-[#e5e5e5]/30 border border-[#14213d]/20 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-[#fca311] focus:border-[#14213d] transition text-[#14213d]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#fca311] hover:bg-[#e08e03] disabled:opacity-50 text-[#14213d] font-bold py-3 rounded-xl transition shadow-md cursor-pointer"
                >
                  {loading ? "Sending code..." : "Send Reset Code"}
                </button>

                <button
                  type="button"
                  onClick={backToLogin}
                  className="w-full flex items-center justify-center gap-2 text-xs font-bold text-[#14213d]/70 hover:text-[#14213d] transition cursor-pointer"
                >
                  <ArrowLeft size={16} /> Back to Login
                </button>
              </form>
            ) : (
              <form onSubmit={handleConfirmReset} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#14213d]/80 mb-2">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="Enter the code from your email"
                    required
                    value={confirmationCode}
                    onChange={(e) => setConfirmationCode(e.target.value)}
                    className="w-full px-4 py-3 text-sm bg-[#e5e5e5]/30 border border-[#14213d]/20 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-[#fca311] focus:border-[#14213d] transition text-[#14213d] tracking-widest text-center"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#14213d]/80 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#14213d]/40" />
                    <input
                      type={showNewPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Enter your new password"
                      required
                      minLength={8}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-11 pr-12 py-3 text-sm bg-[#e5e5e5]/30 border border-[#14213d]/20 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-[#fca311] focus:border-[#14213d] transition text-[#14213d]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      aria-label={showNewPassword ? "Hide new password" : "Show new password"}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#14213d]/40 hover:text-[#14213d] cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#fca311] hover:bg-[#e08e03] disabled:opacity-50 text-[#14213d] font-bold py-3 rounded-xl transition shadow-md cursor-pointer"
                >
                  {loading ? "Resetting password..." : "Reset Password"}
                </button>

                <button
                  type="button"
                  onClick={backToLogin}
                  className="w-full flex items-center justify-center gap-2 text-xs font-bold text-[#14213d]/70 hover:text-[#14213d] transition cursor-pointer"
                >
                  <ArrowLeft size={16} /> Back to Login
                </button>
              </form>
            )
          ) : (
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#14213d]/80 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#14213d]/40" />
                  <input
                    type="email"
                    placeholder="Enter your email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 text-sm bg-[#e5e5e5]/30 border border-[#14213d]/20 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-[#fca311] focus:border-[#14213d] transition text-[#14213d]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#14213d]/80 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#14213d]/40" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-12 py-3 text-sm bg-[#e5e5e5]/30 border border-[#14213d]/20 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-[#fca311] focus:border-[#14213d] transition text-[#14213d]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#14213d]/40 hover:text-[#14213d] cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="text-right">
                <button
                  type="button"
                  className="text-xs font-bold text-[#14213d] hover:text-[#fca311] transition cursor-pointer"
                  onClick={openForgotPassword}
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#14213d] hover:bg-[#0d1629] disabled:opacity-50 text-white font-bold py-3 rounded-xl transition shadow-md cursor-pointer"
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>
          )}

          {!forgotMode && (
            <div className="text-center mt-6 text-xs text-[#14213d]/70">
              Don't have an account?{" "}
              <Link to="/register" className="text-[#14213d] font-bold hover:text-[#fca311] transition">
                Create Account
              </Link>
            </div>
          )}

          <p className="text-center text-[11px] text-[#14213d]/40 mt-6">
            © 2026 DocVault. College Digital Document Management System.
          </p>
        </div>
      </div>
    </div>
  );
}