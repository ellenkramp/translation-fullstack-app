"use client";

import { useState } from "react";
import {
  ITranslateDBObject,
  ITranslateRequest,
  ITranslateResponse,
} from "@tfa/shared-types";
import { fetchAuthSession, getCurrentUser } from "aws-amplify/auth";

const URL = "https://pocq837d54.execute-api.us-east-1.amazonaws.com/prod/";

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

    const result = await fetch(URL, {
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
    const result = await fetch(URL, {
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

export default function Home() {
  const [inputText, setInputText] = useState<string>("");
  const [inputLang, setInputLang] = useState<string>("");
  const [outputLang, setOutputLang] = useState<string>("");
  const [outputText, setOutputText] = useState<ITranslateResponse | null>(null);
  const [translations, setTranslations] = useState<Array<ITranslateDBObject>>(
    []
  );
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
          } catch (e) {
            res = await translatePublicText({
              inputText,
              inputLang,
              outputLang,
            });
            console.log(e);
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
          const res = await getUserTranslations();
          setTranslations(res);
        }}
      >
        get old transations
      </button>
      <pre style={{ whiteSpace: "pre-wrap" }} className="w-full">
        {translations.map((t: ITranslateDBObject) => (
          <div key={t.requestId}>
            <p>
              {t.sourceLang}/{t.sourceText}
            </p>
            <p>
              {t.targetLang}/{t.targetText}
            </p>
          </div>
        ))}
      </pre>
    </main>
  );
}
