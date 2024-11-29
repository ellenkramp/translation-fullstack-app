"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCurrentUser, signIn, signOut } from "aws-amplify/auth";

function Login({ onSignedIn }: { onSignedIn: () => void }) {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        await signIn({
          username: email,
          password,
          options: {
            userAttributes: {
              email,
            },
          },
        });
        onSignedIn();
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
      <button className="btn bg-blue-500 w-full" type="submit">
        Login
      </button>
      <Link className="hover:underline" href="/register">
        Register
      </Link>
    </form>
  );
}

function Logout({ onSignedOut }: { onSignedOut: () => void }) {
  return (
    <div>
      <button
        className="btn bg-blue-500 w-full"
        onClick={async () => {
          await signOut();
          onSignedOut();
        }}
      >
        Logout
      </button>
    </div>
  );
}

export default function User() {
  const [user, setUser] = useState<object | null | undefined>(undefined);
  useEffect(() => {
    async function fetchUser() {
      try {
        const curUser = await getCurrentUser();
        console.log(curUser);
        setUser(curUser);
      } catch (e) {
        console.log(e);
        setUser(null);
      }
    }
    fetchUser();
  }, []);
  if (user === undefined) {
    return <p>...loading</p>;
  }
  if (user) {
    return <Logout onSignedOut={() => setUser(null)} />;
  }
  return (
    <Login
      onSignedIn={async () => {
        const curUser = await getCurrentUser();
        console.log(curUser);
        setUser(curUser);
      }}
    />
  );
}
