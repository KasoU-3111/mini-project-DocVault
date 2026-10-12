import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  signIn,
  getCurrentUser,
  fetchAuthSession,
  resetPassword,
  confirmResetPassword,
} from "aws-amplify/auth";
import {
  FileText,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
} from "lucide-react";

function Login() {
  const navigate = useNavigate();

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

  const redirectUser = async () => {
    const session = await fetchAuthSession();
    const groups = session.tokens?.idToken?.payload["cognito:groups"];

    if (Array.isArray(groups) && groups.includes("Admins")) {
      navigate("/admin/dashboard");
    } else {
      navigate("/student/dashboard");
    }
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      try {
        await getCurrentUser();
        await redirectUser();
        return;
      } catch {
        // No active user session; continue with login.
      }

      const { nextStep } = await signIn({
        username: email.trim(),
        password,
      });

      if (nextStep.signInStep === "DONE") {
        await redirectUser();
      } else {
        setError(
          `Additional sign-in verification is required: ${nextStep.signInStep}`
        );
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Login failed.";

      const name =
        err && typeof err === "object" && "name" in err
          ? String(err.name)
          : "";

      if (name === "NotAuthorizedException") {
        setError("Incorrect email or password.");
      } else if (name === "UserNotFoundException") {
        setError("No account found with this email.");
      } else if (name === "UserNotConfirmedException") {
        setError("Your email is not verified. Please verify your account first.");
      } else {
        setError(message);
      }
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
      const result = await resetPassword({
        username: email.trim(),
      });

      if (
        result.nextStep.resetPasswordStep ===
        "CONFIRM_RESET_PASSWORD_WITH_CODE"
      ) {
        setCodeSent(true);
        setSuccess(
          "If the account is eligible, a password reset code has been sent to its registered contact method."
        );
      } else {
        setError(
          "Cognito returned an unexpected password-reset step. Please try again."
        );
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Could not request a password reset.";

      setError(message);
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
      const message =
        err instanceof Error
          ? err.message
          : "Could not reset your password.";

      const name =
        err && typeof err === "object" && "name" in err
          ? String(err.name)
          : "";

      if (
        name === "CodeMismatchException" ||
        name === "ExpiredCodeException"
      ) {
        setError("The code is invalid or expired. Request a new code and try again.");
      } else if (name === "InvalidPasswordException") {
        setError(
          "The password does not meet your Cognito password policy. Choose a stronger password."
        );
      } else {
        setError(message);
      }
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
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl shadow-lg mb-4">
            <FileText className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-slate-800">DocVault</h1>
          <p className="text-slate-500 mt-2">
            College Digital Document Vault
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-semibold text-slate-800">
            {forgotMode
              ? codeSent
                ? "Reset Your Password"
                : "Forgot Password?"
              : "Welcome Back"}
          </h2>

          <p className="text-slate-500 mt-1 mb-6">
            {forgotMode
              ? codeSent
                ? "Enter the verification code and choose a new password."
                : "Enter your registered email to request a reset code."
              : "Login to access your documents"}
          </p>

          {error && (
            <div
              role="alert"
              className="mb-5 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600"
            >
              {error}
            </div>
          )}

          {success && (
            <div
              role="status"
              className="mb-5 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700"
            >
              {success}
            </div>
          )}

          {forgotMode ? (
            !codeSent ? (
              <form onSubmit={handleSendCode} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Registered Email Address
                  </label>
                  <div className="relative">
                    <Mail
                      size={20}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="email"
                      placeholder="Enter your registered email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-xl transition"
                >
                  {loading ? "Sending code..." : "Send Reset Code"}
                </button>

                <button
                  type="button"
                  onClick={backToLogin}
                  className="w-full flex items-center justify-center gap-2 text-sm text-slate-600 hover:text-blue-600"
                >
                  <ArrowLeft size={16} /> Back to Login
                </button>
              </form>
            ) : (
              <form onSubmit={handleConfirmReset} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
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
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock
                      size={20}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type={showNewPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Enter your new password"
                      required
                      minLength={8}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-11 pr-12 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      aria-label={showNewPassword ? "Hide new password" : "Show new password"}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Your password must also satisfy the rules configured in AWS Cognito.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-xl transition"
                >
                  {loading ? "Resetting password..." : "Reset Password"}
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={() => {
                    setCodeSent(false);
                    setConfirmationCode("");
                    setNewPassword("");
                    setError("");
                    setSuccess("");
                  }}
                  className="w-full text-sm text-blue-600 hover:text-blue-700"
                >
                  Request another code
                </button>

                <button
                  type="button"
                  onClick={backToLogin}
                  className="w-full flex items-center justify-center gap-2 text-sm text-slate-600 hover:text-blue-600"
                >
                  <ArrowLeft size={16} /> Back to Login
                </button>
              </form>
            )
          ) : (
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    size={20}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="email"
                    placeholder="Enter your email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

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
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-12 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="text-right">
                <button
                  type="button"
                  className="text-sm text-blue-600 hover:text-blue-700"
                  onClick={openForgotPassword}
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-xl transition"
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>
          )}

          {!forgotMode && (
            <div className="text-center mt-6 text-sm text-slate-500">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-blue-600 font-semibold hover:text-blue-700"
              >
                Create Account
              </Link>
            </div>
          )}

          <p className="text-center text-xs text-slate-400 mt-6">
            © 2026 DocVault. College Digital Document Management System.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
