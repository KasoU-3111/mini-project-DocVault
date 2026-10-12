// src/pages/Register.tsx
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signUp, confirmSignUp } from "aws-amplify/auth";
import {
  FileText,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
} from "lucide-react";
import { parseAuthError } from "../utils/authUtils";

export default function Register() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [confirmationCode, setConfirmationCode] = useState("");
  const [showVerification, setShowVerification] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const result = await signUp({
        username: email.trim(),
        password,
        options: {
          userAttributes: {
            email: email.trim(),
            name: fullName.trim(),
          },
        },
      });

      if (result.nextStep.signUpStep === "CONFIRM_SIGN_UP") {
        setShowVerification(true);
        setSuccess("Account created successfully! A verification code has been sent to your email.");
      } else {
        setSuccess("Account created successfully!");
        navigate("/login");
      }
    } catch (err: unknown) {
      setError(parseAuthError(err, "Registration failed. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await confirmSignUp({
        username: email.trim(),
        confirmationCode: confirmationCode.trim(),
      });

      setSuccess("Email verified successfully! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err: unknown) {
      setError(parseAuthError(err, "Verification failed. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#e5e5e5] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#14213d] text-[#fca311] rounded-2xl shadow-lg border border-[#14213d]/20 mb-4">
            <FileText size={32} />
          </div>
          <h1 className="text-3xl font-extrabold text-[#14213d] tracking-tight">DocVault</h1>
          <p className="text-[#14213d]/70 text-sm mt-1 font-medium">
            {showVerification ? "Verify your student account" : "Create your student account"}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-[#14213d]/10 p-8">
          {!showVerification ? (
            <>
              <h2 className="text-2xl font-extrabold text-[#14213d]">Create Account</h2>
              <p className="text-[#14213d]/60 text-sm mt-1 mb-6">
                Register to manage your college documents
              </p>

              {error && (
                <div role="alert" className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                  {error}
                </div>
              )}

              {success && (
                <div role="status" className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                  {success}
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#14213d]/80 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#14213d]/40" />
                    <input
                      type="text"
                      placeholder="Enter your full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="w-full pl-11 pr-4 py-3 text-sm bg-[#e5e5e5]/30 border border-[#14213d]/20 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-[#fca311] focus:border-[#14213d] transition text-[#14213d]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#14213d]/80 mb-2">
                    College Email
                  </label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#14213d]/40" />
                    <input
                      type="email"
                      placeholder="Enter your college email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
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
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full pl-11 pr-12 py-3 text-sm bg-[#e5e5e5]/30 border border-[#14213d]/20 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-[#fca311] focus:border-[#14213d] transition text-[#14213d]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#14213d]/40 hover:text-[#14213d] cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#fca311] hover:bg-[#e08e03] disabled:opacity-50 text-[#14213d] font-bold py-3 rounded-xl transition shadow-md mt-2 cursor-pointer"
                >
                  {loading ? "Creating Account..." : "Create Account"}
                </button>
              </form>

              <div className="text-center mt-6 text-xs text-[#14213d]/70">
                Already have an account?{" "}
                <Link to="/login" className="text-[#14213d] font-bold hover:text-[#fca311] transition">
                  Login
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-[#14213d] text-[#fca311] rounded-2xl mb-4 border border-[#14213d]/20 shadow-md">
                  <ShieldCheck size={30} />
                </div>
                <h2 className="text-2xl font-extrabold text-[#14213d]">Verify Your Email</h2>
                <p className="text-[#14213d]/60 text-sm mt-1">We sent a verification code to:</p>
                <p className="font-bold text-[#14213d] mt-1">{email}</p>
              </div>

              {error && (
                <div role="alert" className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                  {error}
                </div>
              )}

              {success && (
                <div role="status" className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                  {success}
                </div>
              )}

              <form onSubmit={handleVerification} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#14213d]/80 mb-2">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    placeholder="Enter verification code"
                    value={confirmationCode}
                    onChange={(e) => setConfirmationCode(e.target.value)}
                    required
                    className="w-full px-4 py-3 text-sm bg-[#e5e5e5]/30 border border-[#14213d]/20 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-[#fca311] focus:border-[#14213d] text-center tracking-widest text-[#14213d]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#14213d] hover:bg-[#0d1629] disabled:opacity-50 text-white font-bold py-3 rounded-xl transition shadow-md cursor-pointer"
                >
                  {loading ? "Verifying..." : "Verify Account"}
                </button>
              </form>

              <div className="text-center mt-6 text-xs text-[#14213d]/70">
                Wrong email?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setShowVerification(false);
                    setError("");
                    setSuccess("");
                  }}
                  className="text-[#14213d] font-bold hover:text-[#fca311] transition cursor-pointer"
                >
                  Go Back
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}