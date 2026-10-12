// src/utils/authUtils.ts

/**
 * Standardized Cognito Error Parser
 */
export function parseAuthError(err: unknown, fallbackMessage: string): string {
  if (!err || typeof err !== "object") return fallbackMessage;

  const errorObj = err as Record<string, any>;
  const name = String(errorObj.name || "");
  const message = String(errorObj.message || fallbackMessage);

  switch (name) {
    case "NotAuthorizedException":
      return "Incorrect email or password.";
    case "UserNotFoundException":
      return "No account found with this email.";
    case "UserNotConfirmedException":
      return "Your email is not verified. Please verify your account first.";
    case "UsernameExistsException":
      return "An account with this email address already exists.";
    case "InvalidPasswordException":
      return "Password does not meet Cognito complexity requirements.";
    case "InvalidParameterException":
      return "Please verify your input details and try again.";
    case "CodeMismatchException":
    case "ExpiredCodeException":
      return "The code is invalid or expired. Please request a new code.";
    default:
      return message;
  }
}