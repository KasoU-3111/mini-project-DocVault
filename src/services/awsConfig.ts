import { Amplify } from "aws-amplify";

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: "ap-south-1_EUSEJfQgX",
      userPoolClientId: "6etq7ivv8i2nkkhmui9aoj6itj",
      identityPoolId: "ap-south-1:cf66ff43-fafe-4a5d-8a35-bba896b35c08",
      loginWith: {
        email: true,
      },
    },
  },

  Storage: {
    S3: {
      bucket: "docvault-student-documents-2026",
      region: "ap-south-1",
    },
  },
});