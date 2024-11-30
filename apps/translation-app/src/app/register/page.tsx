"use client";

import { useEffect, useState } from "react";
import {
  signUp,
  confirmSignUp,
  autoSignIn,
  SignUpOutput,
  SignInOutput,
} from "aws-amplify/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";

type ISignUpState = SignUpOutput["nextStep"];
type ISignInState = SignInOutput["nextStep"];

function RegistrationForm({
  onStepChange,
}: {
  onStepChange: (step: ISignUpState) => void;
}) {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [password2, setPassword2] = useState<string>("");
  const [error, setError] = useState<string>("");
  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        try {
          if (password !== password2) {
            throw new Error("passwords don't match!");
          }
          const { nextStep } = await signUp({
            username: email,
            password: password,
            options: {
              userAttributes: {
                email,
              },
              autoSignIn: true,
            },
          });

          onStepChange(nextStep);
        } catch (e: any) {
          setError(e.toString());
        }
      }}
    >
      <div>
        <label htmlFor="email">Email:</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>
      <div>
        <label htmlFor="password">Password:</label>
        <input
          id="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>
      <div>
        <label htmlFor="password2">Retype Password:</label>
        <input
          id="password2"
          value={password2}
          onChange={(event) => setPassword2(event.target.value)}
        />
      </div>
      <button className="btn bg-blue-500 p-2 mt-2 rounded-xl" type="submit">
        Register
      </button>
      <Link className="hover:underline" href="/user">
        Login
      </Link>
      {error && <p className="text-red-500 font-bold">{error}</p>}
    </form>
  );
}

function AutoSignIn({
  onStepChange,
}: {
  onStepChange: (step: ISignInState) => void;
}) {
  useEffect(() => {
    const asyncSignIn = async () => {
      const { nextStep } = await autoSignIn();
      onStepChange(nextStep);
    };
    asyncSignIn();
  }, []);

  return <div>signing in...</div>;
}

function ConfirmationForm({
  onStepChange,
}: {
  onStepChange: (step: ISignUpState) => void;
}) {
  const [verificationCode, setVerificationCode] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [error, setError] = useState<string>("");

  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        try {
          const { nextStep } = await confirmSignUp({
            confirmationCode: verificationCode,
            username: email,
          });

          onStepChange(nextStep);
        }  catch (e: any) {
          setError(e.toString());
        }
      }}
    >
      <div>
        <label htmlFor="email">Email:</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>
      <div>
        <label htmlFor="verificationCode">Verification Code:</label>
        <input
          id="verificationCode"
          type="text"
          value={verificationCode}
          onChange={(event) => setVerificationCode(event.target.value)}
        />
      </div>
      <button className="btn bg-blue-500 p-2 mt-2 rounded-xl" type="submit">
        Confirm
      </button>
      {error && <p className="text-red-500 font-bold">{error}</p>}
    </form>
  );
}

export default function Register() {
  const router = useRouter();
  const [step, setStep] = useState<ISignUpState | ISignInState | null>(null);

  useEffect(() => {
    if (!step) return;
    if ((step as ISignInState).signInStep === "DONE") {
      router.push("/");
    }
  }, [step]);

  if (step) {
    if ((step as ISignUpState).signUpStep === "CONFIRM_SIGN_UP") {
      return <ConfirmationForm onStepChange={setStep} />;
    }
    if ((step as ISignUpState).signUpStep === "COMPLETE_AUTO_SIGN_IN") {
      return <AutoSignIn onStepChange={setStep} />;
    }
  }
  return <RegistrationForm onStepChange={setStep} />;
}
