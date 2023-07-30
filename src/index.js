export * from "./mailParser.js";

import * as mailParser from "./mailParser.js";
import { setConfig } from "./config.js";

export default (params) => {
  setConfig(params);

  return {
    ...mailParser,
  };
};
