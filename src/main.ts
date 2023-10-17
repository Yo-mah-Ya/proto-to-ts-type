import {
  DescriptorProto,
  EnumDescriptorProto,
  FieldDescriptorProto,
  FileDescriptorProto,
} from "./protobuf/descriptor";
import { getFieldName, getMessageOrEnumWithPackages } from "./field";
import { toTypeName } from "./types";
import { EOL } from "os";
import prettier from "prettier";
import type { Option } from "./option";
import { comments } from "./comments";
import path from "path";
import { removeFileExtension } from "./util";

const createField = (
  {
    fileDescriptor,
    fieldDescriptor,
  }: {
    fileDescriptor: FileDescriptorProto;
    fieldDescriptor: FieldDescriptorProto;
  },
  options: Option
): string => {
  const comment = comments(fieldDescriptor.options?.deprecated);
  const fieldType = toTypeName(fieldDescriptor, fileDescriptor);
  const fieldName = getFieldName(fieldDescriptor, options);
  return `${comment}readonly ${fieldName}?: ${fieldType};`;
};

const createOneOfField = (
  {
    fileDescriptor,
    descriptorProto,
    oneOfIndex,
  }: {
    fileDescriptor: FileDescriptorProto;
    descriptorProto: DescriptorProto;
    oneOfIndex: number;
  },
  options: Option
): string => {
  const fields = descriptorProto.field.filter(
    (field) => field.oneof_index === oneOfIndex
  );
  const unionType = fields
    .map((f) => {
      const fieldName = getFieldName(f, options);
      const field = createField(
        {
          fileDescriptor,
          fieldDescriptor: f,
        },
        options
      );
      return `{ readonly $oneOfField: '${fieldName}', ${field} }`;
    })
    .join(" | ");
  const oneOfName = descriptorProto.oneof_decl[oneOfIndex].name;
  return `readonly ${oneOfName}: ${unionType}`;
};

export const generateMessage = (
  {
    fileDescriptor,
    descriptorProto,
  }: { fileDescriptor: FileDescriptorProto; descriptorProto: DescriptorProto },
  options: Option
): string => {
  const chunks: string[] = [];
  for (const enumDescriptorProto of descriptorProto.enum_type) {
    chunks.push(generateEnum(enumDescriptorProto, options));
  }
  for (const nestedDescriptorProto of descriptorProto.nested_type) {
    chunks.push(
      generateMessage(
        {
          fileDescriptor,
          descriptorProto: nestedDescriptorProto,
        },
        options
      )
    );
  }

  const processedOneOfIndex = new Set<number>();

  const literalNode = descriptorProto.field.map((fieldDescriptor) => {
    const oneOfIndex = fieldDescriptor.oneof_index;
    if (
      typeof oneOfIndex === "number" &&
      !fieldDescriptor.proto3_optional &&
      !processedOneOfIndex.has(oneOfIndex)
    ) {
      processedOneOfIndex.add(oneOfIndex);
      return createOneOfField(
        { fileDescriptor, descriptorProto, oneOfIndex },
        options
      );
    }
    return createField({ fileDescriptor, fieldDescriptor }, options);
  });

  const comment = comments(descriptorProto.options?.deprecated);
  if (literalNode.length) {
    chunks.push(
      `${comment}export type ${
        descriptorProto.name
      } = {${EOL}${literalNode.join(EOL)}${EOL}};`
    );
  } else {
    chunks.push(`${comment}export interface ${descriptorProto.name}{${EOL}};`);
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
  return `${comment}export enum ${enumDescriptor.name} {${EOL}${members}${EOL}};`;
};

export const generateFile = (
  fileDescriptor: FileDescriptorProto,
  options: Option
): Promise<string> => {
  const statements: string[] = ["/* eslint-disable */"];

  const enums = fileDescriptor.enum_type.flatMap((enumDescriptor) =>
    generateEnum(enumDescriptor, options)
  );
  const messages = fileDescriptor.message_type.flatMap((messageDescriptor) =>
    generateMessage(
      {
        fileDescriptor,
        descriptorProto: messageDescriptor,
      },
      options
    )
  );

  statements.push(
    fileDescriptor.dependency
      .map((dependency) => {
        if (!fileDescriptor.name) return;
        if (!fileDescriptor?.package) return;

        const types = getMessageOrEnumWithPackages(fileDescriptor.package);
        if (!types?.length) return;
        return `import {${types.join(", ")}} from "${path.relative(
          path.dirname(fileDescriptor.name),
          removeFileExtension(dependency, "")
        )}";`;
      })
      .join(EOL)
  );

  if (fileDescriptor.syntax) {
    statements.push(`export const syntax = "${fileDescriptor.syntax}";`);
  }
  if (fileDescriptor.package) {
    statements.push(
      `export const protocolBufferPackage = "${fileDescriptor.package}";`
    );
  }

  statements.push(...enums, ...messages);

  return prettier.format(statements.join(EOL), {
    parser: "typescript",
  });
};
