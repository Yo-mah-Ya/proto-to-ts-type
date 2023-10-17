import { EOL } from "os";

export const comments = (deprecated?: boolean): string => {
  return deprecated
    ? `
  /**
  * @deprecated
  */${EOL}`
    : "";
};
