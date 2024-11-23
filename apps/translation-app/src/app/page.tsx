"use client";

import { useState } from "react";
import {
  ITranslateDBObject,
  ITranslateRequest,
  ITranslateResponse,
} from "@tfa/shared-types";

const URL = "https://lyy2g1txw5.execute-api.us-east-1.amazonaws.com/prod/";

const translateText = async ({
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
    const result = await fetch(URL, {
      method: "POST",
      body: JSON.stringify(request),
    });

    const returnValue = (await result.json()) as ITranslateResponse;

    return returnValue;
  } catch (e) {
    throw e;
  }
};

const getTranslations = async () => {
  try {
    const result = await fetch(URL, {
      method: "GET",
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

          const res = await translateText({
            inputText,
            inputLang,
            outputLang,
          });

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
          const res = await getTranslations();
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
