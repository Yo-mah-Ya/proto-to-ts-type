import {
  DescriptorProto,
  EnumDescriptorProto,
  FileDescriptorProto,
} from "./protobuf/descriptor";
import { toTypeName } from "./field";
import { EOL } from "os";
import prettier from "prettier";
import type { Option } from "./option";

export const generateMessage = (
  fileDescriptor: FileDescriptorProto,
  messageDescriptor: DescriptorProto,
  options: Option
): string => {
  const chunks: string[] = [];
  for (const fieldDescriptor of messageDescriptor.field) {
    const fieldType = toTypeName(fieldDescriptor, fileDescriptor);
    const fieldName = options.useJsonName
      ? fieldDescriptor.json_name
      : fieldDescriptor.name;
    chunks.push(`readonly ${fieldName}?: ${fieldType};`);
  }
  return `export type ${messageDescriptor.name} = {${chunks.join(`${EOL}`)}};`;
};

export const generateEnum = (
  enumDescriptor: EnumDescriptorProto,
  options: Option
): string => {
  const members = enumDescriptor.value
    .map((enumValueDescriptor) => {
      enumValueDescriptor.options;
      return `${enumValueDescriptor.name} = ${
        options.enumValueAsString
          ? `"${enumValueDescriptor.name}"`
          : enumValueDescriptor.number
      }`;
    })
    .join(",");
  return `export enum ${enumDescriptor.name} {${members}};`;
};

export const generateFile = (
  fileDescriptor: FileDescriptorProto,
  options: Option
): Promise<string> => {
  const statements: string[] = [
    "/* eslint-disable */",
    `export const syntax = "${fileDescriptor.syntax}";`,
    `export const protobufPackage = "${fileDescriptor.package}";`,

    ...fileDescriptor.message_type.flatMap((messageDescriptor) =>
      generateMessage(fileDescriptor, messageDescriptor, options)
    ),
    ...fileDescriptor.enum_type.flatMap((enumDescriptor) =>
      generateEnum(enumDescriptor, options)
    ),
  ];
  return prettier.format(statements.join(EOL) + EOL, { parser: "typescript" });
};
