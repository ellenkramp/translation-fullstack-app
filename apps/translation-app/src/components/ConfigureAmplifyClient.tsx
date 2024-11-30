"use client";
import { Amplify } from "aws-amplify";

Amplify.configure(
  {
    Auth: {
      Cognito: {
        userPoolId: "us-east-1_MumU9pC0U",
        userPoolClientId: "28q82lk1sshrtbs3pulfbeg5lp",
      },
    },
  },
  { ssr: true }
);

export function ConfigureAmplifyClient() {
  return null;
}
