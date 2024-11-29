"use client";
import { Amplify } from "aws-amplify";

Amplify.configure(
  {
    Auth: {
      Cognito: {
        userPoolId: "us-east-1_NTxPxuhct",
        userPoolClientId: "34bk63gk7hj7a0e9u3pdhsjs58",
      },
    },
  },
  { ssr: true }
);

export function ConfigureAmplifyClient() {
  return null;
}
