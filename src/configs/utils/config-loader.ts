import merge from "lodash/merge";
import commonConfig from "../common";
import developmentConfig from "../development";

type ImageDefaults = {
  greetings: string;
  who: string;
  width?: number;
  height?: number;
  color?: string;
  size?: number;
};

type FileConfig = {
  name: string;
  extension: string;
};

type Config = {
  imageDefaults: ImageDefaults;
  baseUrl?: string;
  file?: FileConfig;
};

function loadConfig(): Config {
  const env = process.env.NODE_ENV?.toLowerCase();

  let config: Config;

  switch (env) {
    case "development":
      config = merge({}, commonConfig, developmentConfig);
      break;
    default:
      config = commonConfig;
      break;
  }

  return config;
}

export default loadConfig;
