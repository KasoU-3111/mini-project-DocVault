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

function Register() {
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

  // -----------------------------
  // Register user
  // -----------------------------
  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const result = await signUp({
        username: email,
        password: password,
        options: {
          userAttributes: {
            email: email,
            name: fullName,
          },
        },
      });

      console.log("Signup result:", result);

      if (result.nextStep.signUpStep === "CONFIRM_SIGN_UP") {
        setShowVerification(true);
        setSuccess(
          "Account created successfully! A verification code has been sent to your email."
        );
      } else {
        setSuccess("Account created successfully!");
        navigate("/login");
      }
    } catch (err: any) {
      console.error("Registration error:", err);

      if (err.name === "UsernameExistsException") {
        setError("An account with this email already exists.");
      } else if (err.name === "InvalidPasswordException") {
        setError(
          "Password does not meet AWS Cognito password requirements."
        );
      } else if (err.name === "InvalidParameterException") {
        setError("Please check your name, email, and password.");
      } else {
        setError(err.message || "Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // Verify user
  // -----------------------------
  const handleVerification = async (e: FormEvent) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const result = await confirmSignUp({
        username: email,
        confirmationCode: confirmationCode,
      });

      console.log("Verification result:", result);

      setSuccess(
        "Email verified successfully! You can now login to DocVault."
      );

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err: any) {
      console.error("Verification error:", err);

      if (err.name === "CodeMismatchException") {
        setError("Invalid verification code. Please try again.");
      } else if (err.name === "ExpiredCodeException") {
        setError(
          "Verification code has expired. Please request a new code."
        );
      } else {
        setError(
          err.message || "Verification failed. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl shadow-lg mb-4">
            <FileText className="text-white" size={32} />
          </div>

          <h1 className="text-3xl font-bold text-slate-800">
            DocVault
          </h1>

          <p className="text-slate-500 mt-2">
            {showVerification
              ? "Verify your student account"
              : "Create your student account"}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">

          {!showVerification ? (
            <>
              {/* Registration Form */}

              <h2 className="text-2xl font-semibold text-slate-800">
                Create Account
              </h2>

              <p className="text-slate-500 mt-1 mb-6">
                Register to manage your college documents
              </p>

              {/* Error */}
              {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                  {error}
                </div>
              )}

              {/* Success */}
              {success && (
                <div className="mb-4 p-3 rounded-xl bg-green-50 border border-green-200 text-green-600 text-sm">
                  {success}
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-4">

                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Full Name
                  </label>

                  <div className="relative">
                    <User
                      size={20}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="text"
                      placeholder="Enter your full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    College Email
                  </label>

                  <div className="relative">
                    <Mail
                      size={20}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="email"
                      placeholder="Enter your college email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Password
                  </label>

                  <div className="relative">
                    <Lock
                      size={20}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full pl-11 pr-12 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(!showPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                    >
                      {showPassword ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Register Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-xl transition mt-2"
                >
                  {loading ? "Creating Account..." : "Create Account"}
                </button>

              </form>

              {/* Login */}
              <div className="text-center mt-6 text-sm text-slate-500">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-blue-600 font-semibold hover:text-blue-700"
                >
                  Login
                </Link>
              </div>
            </>
          ) : (
            <>
              {/* Verification Form */}

              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-100 rounded-full mb-4">
                  <ShieldCheck
                    className="text-blue-600"
                    size={30}
                  />
                </div>

                <h2 className="text-2xl font-semibold text-slate-800">
                  Verify Your Email
                </h2>

                <p className="text-slate-500 mt-2">
                  We sent a verification code to:
                </p>

                <p className="font-semibold text-slate-700 mt-1">
                  {email}
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                  {error}
                </div>
              )}

              {/* Success */}
              {success && (
                <div className="mb-4 p-3 rounded-xl bg-green-50 border border-green-200 text-green-600 text-sm">
                  {success}
                </div>
              )}

              <form
                onSubmit={handleVerification}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Verification Code
                  </label>

                  <input
                    type="text"
                    placeholder="Enter verification code"
                    value={confirmationCode}
                    onChange={(e) =>
                      setConfirmationCode(e.target.value)
                    }
                    required
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center tracking-widest"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-xl transition"
                >
                  {loading ? "Verifying..." : "Verify Account"}
                </button>
              </form>

              <div className="text-center mt-6 text-sm text-slate-500">
                Wrong email?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setShowVerification(false);
                    setError("");
                    setSuccess("");
                  }}
                  className="text-blue-600 font-semibold hover:text-blue-700"
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

export default Register;