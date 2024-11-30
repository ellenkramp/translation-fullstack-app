"use client";

import { useState } from "react";
import {
  ITranslateDBObject,
  ITranslateRequest,
  ITranslateResponse,
} from "@tfa/shared-types";
import { fetchAuthSession, getCurrentUser } from "aws-amplify/auth";

const URL = "https://1ml3i7bvtd.execute-api.us-east-1.amazonaws.com/prod/";

const translatePublicText = async ({
  inputLang,
  outputLang,
  inputText,
}: {
  inputLang: string;
  outputLang: string;
  inputText: string;
}) => {
  try {
    const request: ITranslateRequest = {
      sourceLang: inputLang,
      targetLang: outputLang,
      sourceText: inputText,
    };

    const result = await fetch(`${URL}/public`, {
      method: "POST",
      body: JSON.stringify(request),
    });

    const returnValue = (await result.json()) as ITranslateResponse;

    return returnValue;
  } catch (e) {
    throw e;
  }
};

const translateUserText = async ({
  inputLang,
  outputLang,
  inputText,
}: {
  inputLang: string;
  outputLang: string;
  inputText: string;
}) => {
  try {
    const request: ITranslateRequest = {
      sourceLang: inputLang,
      targetLang: outputLang,
      sourceText: inputText,
    };

    const authToken = (await fetchAuthSession()).tokens?.idToken?.toString();

    const result = await fetch(`${URL}/user`, {
      method: "POST",
      body: JSON.stringify(request),
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    const returnValue = (await result.json()) as ITranslateResponse;

    return returnValue;
  } catch (e) {
    throw e;
  }
};

const getUserTranslations = async () => {
  try {
    const authToken = (await fetchAuthSession()).tokens?.idToken?.toString();
    const result = await fetch(`${URL}/user`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    const returnValue = (await result.json()) as Array<ITranslateDBObject>;

    return returnValue;
  } catch (e) {
    throw e;
  }
};

const deleteUserTranslation = async (requestId: string) => {
  try {
    const authToken = (await fetchAuthSession()).tokens?.idToken?.toString();
    const body = { requestId };

    const result = await fetch(`${URL}/user`, {
      method: "DELETE",
      body: JSON.stringify(body),
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    const returnValue = (await result.json()) as Array<ITranslateDBObject>;

    return returnValue;
  } catch (e) {
    throw e;
  }
};

export default function Home() {
  const [inputText, setInputText] = useState<string>("");
  const [inputLang, setInputLang] = useState<string>("");
  const [outputLang, setOutputLang] = useState<string>("");
  const [outputText, setOutputText] = useState<ITranslateResponse | null>(null);
  const [translations, setTranslations] = useState<Array<ITranslateDBObject>>(
    []
  );
  const [error, setError] = useState<string>("");
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <form
        onSubmit={async (event) => {
          event.preventDefault();

          let res = null;
          try {
            const user = await getCurrentUser();
            if (user) {
              res = await translateUserText({
                inputText,
                inputLang,
                outputLang,
              });
            } else {
              throw new Error("user not logged in");
            }
          } catch (e: any) {
            res = await translatePublicText({
              inputText,
              inputLang,
              outputLang,
            });
          }
          setOutputText(res);
        }}
      >
        <div>
          <label htmlFor="inputText">Input Text</label>
          <textarea
            id="inputText"
            value={inputText}
            onChange={(event) => setInputText(event.target.value)}
          />
        </div>
        <div>
          <label htmlFor="inputLang">Input Language</label>
          <input
            id="inputLang"
            value={inputLang}
            onChange={(event) => setInputLang(event.target.value)}
          />
        </div>
        <div>
          <label htmlFor="outputLang">Output Language</label>
          <input
            id="outputLang"
            value={outputLang}
            onChange={(event) => setOutputLang(event.target.value)}
          />
        </div>
        <button className="btn bg-blue-500 p-2 mt-2 rounded-xl" type="submit">
          Translate!
        </button>
      </form>
      <pre style={{ whiteSpace: "pre-wrap" }} className="w-full">
        {JSON.stringify(outputText, null, 2)}
      </pre>
      <button
        className="btn bg-blue-500 p-2 mt-2 rounded-xl"
        onClick={async () => {
          try {
            const res = await getUserTranslations();
            setTranslations(res);
          } catch (e: any) {
            setError(e.toString());
          }
        }}
      >
        get old transations
      </button>
      <div className="flex flex-col space-y-2 p-1">
        {translations.map((t: ITranslateDBObject) => (
          <div
            className="flex flex-row justify-between bg-slate-400 space-x-2 p-1"
            key={t.requestId}
          >
            <p>
              {t.sourceLang}/{t.sourceText}
            </p>
            <p>
              {t.targetLang}/{t.targetText}
            </p>
            <button
              className="btn bg-red-500 hover:bg-red-300 rounded-md p-1"
              type="button"
              onClick={async () => {
                try {
                  const returnValue = await deleteUserTranslation(t.requestId);
                  setTranslations(returnValue);
                } catch (e: any) {
                  setError(e.toString());
                }
              }}
            >
              x
            </button>
          </div>
        ))}
      </div>
      {error && <p className="text-red-500 font-bold">{error}</p>}
    </main>
  );
}
