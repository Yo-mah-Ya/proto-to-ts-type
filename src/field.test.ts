describe("field", () => {
  test("same package", async () => {
    const { getMessageOrEnumWithPackages, getMessageOrEnumName } = await import(
      "./field"
    );

    const packageName = "google.protobuf.coompiler";
    expect(
      getMessageOrEnumName({
        fileDescriptorProto: { package: packageName },
        fieldDescriptor: { type_name: ".google.protobuf.coompiler.Test" },
      })
    ).toBe("Test");
    expect(getMessageOrEnumWithPackages(packageName)).toBeUndefined();
  });
  test("different package", async () => {
    const { getMessageOrEnumWithPackages, getMessageOrEnumName } = await import(
      "./field"
    );

    const packageName = "google.protobuf.plugin";
    expect(
      getMessageOrEnumName({
        fileDescriptorProto: { package: packageName },
        fieldDescriptor: { type_name: ".google.protobuf.coompiler.Test" },
      })
    ).toBe("Test");

    expect(getMessageOrEnumWithPackages(packageName)).toContain("Test");
  });
});
