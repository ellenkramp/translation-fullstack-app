"use client";
import { Amplify } from "aws-amplify";

Amplify.configure(
  {
    Auth: {
      Cognito: {
        userPoolId: "us-east-1_18DraeTH4",
        userPoolClientId: "4fnnghrqn551du5png6hsl9u56",
      },
    },
  },
  { ssr: true }
);

export function ConfigureAmplifyClient() {
  return null;
}
