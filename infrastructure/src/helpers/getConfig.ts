import * as dotenv from "dotenv";
import { IAppConfig } from "./IAppTypes";

export const getConfig = (): IAppConfig => {
  dotenv.config({ path: "../.env" });
  const { AWS_ACCOUNT_ID, AWS_REGION, DOMAIN, API_SUBDOMAIN, WEB_SUBDOMAIN } =
    process.env;

  if (!AWS_ACCOUNT_ID) {
    throw new Error("AWS_ACCOUNT_ID not specified");
  }
  if (!AWS_REGION) {
    throw new Error("AWS_REGION not specified");
  }

  return {
    awsAccountID: AWS_ACCOUNT_ID,
    awsRegion: AWS_REGION,
  };
};
