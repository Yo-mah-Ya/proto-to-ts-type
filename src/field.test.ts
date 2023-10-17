describe("field", () => {
  test("same package", async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { getMessageOrEnumWithPackages, getMessageOrEnumName } = await import(
      "./field"
    );

    const packageName = "google.protobuf.coompiler";
    expect(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      getMessageOrEnumName({
        fileDescriptorProto: { package: packageName },
        fieldDescriptor: { type_name: ".google.protobuf.coompiler.Test" },
      }),
    ).toBe("Test");
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    expect(getMessageOrEnumWithPackages(packageName)).toBeUndefined();
  });
  test("different package", async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { getMessageOrEnumWithPackages, getMessageOrEnumName } = await import(
      "./field"
    );

    const packageName = "google.protobuf.plugin";
    expect(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      getMessageOrEnumName({
        fileDescriptorProto: { package: packageName },
        fieldDescriptor: { type_name: ".google.protobuf.coompiler.Test" },
      }),
    ).toBe("Test");

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    expect(getMessageOrEnumWithPackages(packageName)).toContain("Test");
  });
});
