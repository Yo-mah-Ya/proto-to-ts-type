import type { Option } from "./option";
import {
  FieldDescriptorProto,
  FileDescriptorProto,
} from "./protobuf/descriptor";

const messageOrEnumWithPackages = new Map<string, string[]>();
export const getMessageOrEnumWithPackages = (
  key: string
): string[] | undefined => messageOrEnumWithPackages.get(key);

export const getMessageOrEnumName = ({
  fieldDescriptor,
  fileDescriptorProto,
}: {
  fieldDescriptor: Pick<FieldDescriptorProto, "type_name">;
  fileDescriptorProto: Pick<FileDescriptorProto, "package">;
}): string => {
  const typeName = fieldDescriptor.type_name.split(".").slice(-1).join("");
  if (
    // Type name is defined in an other package/file. So we need to import the type from there.
    // Here just store the type we have to import from other packages.
    !fieldDescriptor.type_name.startsWith(`.${fileDescriptorProto?.package}`) &&
    fileDescriptorProto?.package
  ) {
    const get = (): string[] | undefined =>
      messageOrEnumWithPackages.get(fileDescriptorProto.package as string);
    if (!get()) {
      messageOrEnumWithPackages.set(fileDescriptorProto.package, []);
    }
    get()?.push(typeName);
  }
  return typeName;
};

export const getFieldName = (
  fieldDescriptor: FieldDescriptorProto,
  options: Option
): string =>
  options.useJsonName ? fieldDescriptor.json_name : fieldDescriptor.name;
