import * as clientTranslate from "@aws-sdk/client-translate";
import { ITranslateRequest } from "@tfa/shared-types";

export async function getTranslation({
  sourceLang,
  targetLang,
  sourceText,
}: ITranslateRequest) {
  const translateClient = new clientTranslate.TranslateClient({});

  const translateCommand = new clientTranslate.TranslateTextCommand({
    SourceLanguageCode: sourceLang,
    TargetLanguageCode: targetLang,
    Text: sourceText,
  });

  const res = await translateClient.send(translateCommand);

  return res;
}
