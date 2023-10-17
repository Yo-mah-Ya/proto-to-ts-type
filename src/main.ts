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
import { comments } from "./comments";
import path from "path";
import { removeFileExtension } from "./util";

const createField = (
  fileDescriptor: FileDescriptorProto,
  fieldDescriptor: FieldDescriptorProto,
  options: Option
): string => {
  const comment = comments(fieldDescriptor.options?.deprecated);
  const fieldType = toTypeName(fieldDescriptor, fileDescriptor);
  const fieldName = options.useJsonName
    ? fieldDescriptor.json_name
    : fieldDescriptor.name;
  return `${comment}readonly ${fieldName}?: ${fieldType};`;
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

  const comment = comments(descriptorProto.options?.deprecated);
  if (literalNode.length) {
    chunks.push(
      `${comment}export type ${descriptorProto.name} = {${literalNode.join(
        EOL
      )}};`
    );
  } else {
    chunks.push(`${comment}export interface ${descriptorProto.name}{};`);
  }
  return chunks.join(EOL);
};

export const generateEnum = (
  enumDescriptor: EnumDescriptorProto,
  options: Option
): string => {
  const comment = comments(enumDescriptor.options?.deprecated);
  const members = enumDescriptor.value
    .map((enumValueDescriptor) => {
      const comment = comments(enumValueDescriptor.options?.deprecated);
      return `${comment}${enumValueDescriptor.name} = ${
        options.enumValueAsString
          ? `"${enumValueDescriptor.name}"`
          : enumValueDescriptor.number
      }`;
    })
    .join(",");
  return `${comment}export enum ${enumDescriptor.name} {${members}};`;
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
      `export const protocolBufferPackage = "${fileDescriptor.package}";`
    );
  }
  statements.push(
    fileDescriptor.dependency
      .map((dependency) => {
        if (!fileDescriptor.name) return;
        return `import "${path.relative(
          path.dirname(fileDescriptor.name),
          removeFileExtension(dependency, "")
        )}"`;
      })
      .join(EOL)
  );

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
