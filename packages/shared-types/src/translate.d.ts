export type ITranslateRequest = {
  sourceLang: string;
  targetLang: string;
  sourceText: string;
};

export type ITranslateResponse = {
  timestamp: string;
  targetText: string;
};

export type ITranslateDBObject = ITranslateRequest &
  ITranslateResponse & {
    requestId: string;
    username: string;
  };
