import { EOL } from "os";

export type Option = {
  useJsonName: boolean;
  enumValueAsString: boolean;
  useTypeGuardForOneOf: boolean;
};

export const toOptions = (parameters: string): Option => {
  const defaultOption: Option = {
    useJsonName: false,
    enumValueAsString: false,
    useTypeGuardForOneOf: false,
  };
  if (parameters === "") {
    return defaultOption;
  }

  for (const parameter of parameters.replace(/\s+/g, "").split(",")) {
    const [key, value] = parameter.split("=", 2) as [
      keyof Option,
      string | undefined,
    ];
    if (typeof value !== "string") {
      console.warn(
        `Unknown option: ${key}=${value ?? ""}${EOL}`,
        'The pairs of key and value are supposed to be delimited by equal sign "=".',
      );
      continue;
    }
    switch (key) {
      case "useJsonName": {
        if (["true", "false"].includes(value)) {
          defaultOption.useJsonName = "true" === value;
        } else {
          console.warn('"useJsonName" option must be either "true" or "false"');
        }
        continue;
      }
      case "enumValueAsString": {
        if (["true", "false"].includes(value)) {
          defaultOption.enumValueAsString = "true" === value;
        } else {
          console.warn(
            '"enumValueAsString" option must be either "true" or "false"',
          );
        }
        continue;
      }
      case "useTypeGuardForOneOf":
        if (["true", "false"].includes(value)) {
          defaultOption.useTypeGuardForOneOf = "true" === value;
        } else {
          console.warn(
            '"useTypeGuardForOneOf" option must be either "true" or "false"',
          );
        }
        continue;
      default:
        continue;
    }
  }
  return defaultOption;
};
