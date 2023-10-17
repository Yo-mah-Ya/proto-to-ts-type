import { toOptions } from "./option";

describe(toOptions, () => {
  test("no option", () => {
    expect(toOptions("")).toStrictEqual({
      useJsonName: false,
      enumValueAsString: false,
    });
  });
  describe("unparsable", () => {
    test("delimited by other than comma", () => {
      const warnLog = jest.spyOn(console, "warn");
      expect(
        toOptions("useJsonName=true:enumValueAsString=true"),
      ).toStrictEqual({
        useJsonName: false,
        enumValueAsString: false,
      });
      expect(warnLog).toHaveBeenCalled();
    });

    test("not delimited by equal sign", () => {
      const warnLog = jest.spyOn(console, "warn");
      expect(toOptions("useJsonName")).toStrictEqual({
        useJsonName: false,
        enumValueAsString: false,
      });
      expect(warnLog).toHaveBeenCalled();
    });
  });

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

  test("unknown parameter", () => {
    expect(toOptions("key=value")).toStrictEqual({
      useJsonName: false,
      enumValueAsString: false,
    });
  });
});
