import { toOptions } from "./option";

describe(toOptions, () => {
  const defaultOption = {
    useJsonName: false,
    enumValueAsString: false,
    useTypeGuardForOneOf: false,
  };
  test("no option", () => {
    expect(toOptions("")).toStrictEqual(defaultOption);
  });
  describe("unparsable", () => {
    test("delimited by other than comma", () => {
      const warnLog = jest.spyOn(console, "warn");
      expect(
        toOptions("useJsonName=true:enumValueAsString=true"),
      ).toStrictEqual(defaultOption);
      expect(warnLog).toHaveBeenCalled();
    });

    test("not delimited by equal sign", () => {
      const warnLog = jest.spyOn(console, "warn");
      expect(toOptions("useJsonName")).toStrictEqual(defaultOption);
      expect(warnLog).toHaveBeenCalled();
    });
  });

  test("unknown parameter", () => {
    expect(toOptions("key=value")).toStrictEqual(defaultOption);
  });
});

describe("individual options", () => {
  test("useJsonName", () => {
    expect(toOptions("useJsonName=false")).toHaveProperty("useJsonName", false);
    expect(toOptions("useJsonName=true")).toHaveProperty("useJsonName", true);
    const warnLog = jest.spyOn(console, "warn");
    expect(toOptions("useJsonName=dummy")).toHaveProperty("useJsonName", false);
    expect(warnLog).toHaveBeenCalled();
  });

  test("enumValueAsString", () => {
    expect(toOptions("enumValueAsString=false")).toHaveProperty(
      "enumValueAsString",
      false,
    );
    expect(toOptions("enumValueAsString=true")).toHaveProperty(
      "enumValueAsString",
      true,
    );
    const warnLog = jest.spyOn(console, "warn");
    expect(toOptions("enumValueAsString=dummy")).toHaveProperty(
      "enumValueAsString",
      false,
    );
    expect(warnLog).toHaveBeenCalled();
  });

  test("useTypeGuardForOneOf", () => {
    expect(toOptions("useTypeGuardForOneOf=false")).toHaveProperty(
      "useTypeGuardForOneOf",
      false,
    );
    expect(toOptions("useTypeGuardForOneOf=true")).toHaveProperty(
      "useTypeGuardForOneOf",
      true,
    );
    const warnLog = jest.spyOn(console, "warn");
    expect(toOptions("useTypeGuardForOneOf=dummy")).toHaveProperty(
      "useTypeGuardForOneOf",
      false,
    );
    expect(warnLog).toHaveBeenCalled();
  });
});
