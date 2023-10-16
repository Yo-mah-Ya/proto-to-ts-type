import {
  DescriptorProto,
  EnumDescriptorProto,
  FieldDescriptorProto,
  FileDescriptorProto,
} from "./protobuf/descriptor";
import { toTypeName } from "./field";
import { EOL } from "os";
import prettier from "prettier";
import type { Option } from "./option";

const createField = (
  fileDescriptor: FileDescriptorProto,
  fieldDescriptor: FieldDescriptorProto,
  options: Option
): string => {
  const fieldType = toTypeName(fieldDescriptor, fileDescriptor);
  const fieldName = options.useJsonName
    ? fieldDescriptor.json_name
    : fieldDescriptor.name;
  return `readonly ${fieldName}?: ${fieldType};`;
};

export const generateMessage = (
  fileDescriptor: FileDescriptorProto,
  descriptorProto: DescriptorProto,
  options: Option
): string => {
  const chunks: string[] = [];
  for (const enumDescriptorProto of descriptorProto.enum_type) {
    chunks.push(generateEnum(enumDescriptorProto, options));
  }
  for (const nestedDescriptorProto of descriptorProto.nested_type) {
    chunks.push(
      generateMessage(fileDescriptor, nestedDescriptorProto, options)
    );
  }
  const literalNode = descriptorProto.field.map((fieldDescriptor) =>
    createField(fileDescriptor, fieldDescriptor, options)
  );
  if (literalNode.length) {
    chunks.push(
      `export type ${descriptorProto.name} = {${literalNode.join(EOL)}};`
    );
  } else {
    chunks.push(`export interface ${descriptorProto.name}{};`);
  }
  return chunks.join(EOL);
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
  const statements: string[] = ["/* eslint-disable */"];
  if (fileDescriptor.syntax) {
    statements.push(`export const syntax = "${fileDescriptor.syntax}";`);
  }
  if (fileDescriptor.package) {
    statements.push(
      `export const protobufPackage = "${fileDescriptor.package}";`
    );
  }
  statements.push(
    ...fileDescriptor.enum_type.flatMap((enumDescriptor) =>
      generateEnum(enumDescriptor, options)
    ),
    ...fileDescriptor.message_type.flatMap((messageDescriptor) =>
      generateMessage(fileDescriptor, messageDescriptor, options)
    )
  );
  return prettier.format(statements.join(EOL), {
    parser: "typescript",
  });
};
