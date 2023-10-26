import {
  DescriptorProto,
  EnumDescriptorProto,
  FieldDescriptorProto,
  FileDescriptorProto,
} from "./protobuf/descriptor";
import { getFieldName, getMessageOrEnumWithPackages } from "./field";
import { toOptional, toTypeName } from "./types";
import { EOL } from "os";
import prettier from "prettier";
import type { Option } from "./option";
import { comments } from "./comments";
import path from "path";
import { removeFileExtension } from "./util";

const getFieldSet = (
  {
    fileDescriptorProto,
    fieldDescriptor,
  }: {
    fileDescriptorProto: FileDescriptorProto;
    fieldDescriptor: FieldDescriptorProto;
  },
  options: Option,
): {
  comment: string;
  fieldName: string;
  optionalSign: string;
  fieldType: string;
} => {
  const comment = comments(fieldDescriptor.options?.deprecated);
  const fieldType = toTypeName({
    fieldDescriptor,
    fileDescriptorProto,
  });
  const fieldName = getFieldName(fieldDescriptor, options);
  const optionalSign = toOptional({ fieldDescriptor });
  return {
    comment,
    fieldName,
    optionalSign,
    fieldType,
  };
};

const createOneOfField = (
  {
    fileDescriptorProto,
    descriptorProto,
    oneOfIndex,
  }: {
    fileDescriptorProto: FileDescriptorProto;
    descriptorProto: DescriptorProto;
    oneOfIndex: number;
  },
  typeGuardFuncsForOneOf: string[],
  options: Option,
): string => {
  const fields = descriptorProto.field.filter(
    (field) => field.oneof_index === oneOfIndex,
  );
  const oneOfName = descriptorProto.oneof_decl[oneOfIndex].name;
  const unionType = fields
    .map((f) => {
      const { comment, fieldName, fieldType } = getFieldSet(
        { fileDescriptorProto, fieldDescriptor: f },
        options,
      );
      const variableName = `is${
        fieldName.charAt(0).toUpperCase() + fieldName.slice(1)
      }Of${oneOfName}Of${descriptorProto.name}`;
      typeGuardFuncsForOneOf.push(`
      export const ${variableName} = (v: ${descriptorProto.name}["${oneOfName}"]): v is { $oneOfField: "${fieldName}"; ${fieldName}: ${fieldType} } =>
        v.$oneOfField === "${fieldName}";
      `);
      return `{ ${comment}readonly $oneOfField: '${fieldName}', ${fieldName}: ${fieldType} }`;
    })
    .join(" | ");
  return `readonly ${oneOfName}: ${unionType}`;
};

export const generateMessage = (
  {
    fileDescriptorProto,
    descriptorProto,
  }: {
    fileDescriptorProto: FileDescriptorProto;
    descriptorProto: DescriptorProto;
  },
  options: Option,
): string => {
  const chunks: string[] = [];
  for (const enumDescriptorProto of descriptorProto.enum_type) {
    chunks.push(generateEnum(enumDescriptorProto, options));
  }
  for (const nestedDescriptorProto of descriptorProto.nested_type) {
    chunks.push(
      generateMessage(
        {
          fileDescriptorProto,
          descriptorProto: nestedDescriptorProto,
        },
        options,
      ),
    );
  }

  const processedOneOfIndex = new Set<number>();

  const literalNode: string[] = [];
  const typeGuardFuncsForOneOf: string[] = [];

  for (const fieldDescriptor of descriptorProto.field) {
    const oneOfIndex = fieldDescriptor.oneof_index;
    if (
      descriptorProto.oneof_decl.length &&
      !fieldDescriptor.proto3_optional &&
      !processedOneOfIndex.has(oneOfIndex) &&
      options.useTypeGuardForOneOf
    ) {
      processedOneOfIndex.add(oneOfIndex);
      literalNode.push(
        createOneOfField(
          { fileDescriptorProto, descriptorProto, oneOfIndex },
          typeGuardFuncsForOneOf,
          options,
        ),
      );
    }
    if (processedOneOfIndex.has(oneOfIndex)) continue;

    const { comment, fieldName, optionalSign, fieldType } = getFieldSet(
      { fileDescriptorProto, fieldDescriptor },
      options,
    );
    literalNode.push(
      `${comment}readonly ${fieldName}${optionalSign}: ${fieldType};`,
    );
  }

  const comment = comments(descriptorProto.options?.deprecated);
  if (literalNode.length) {
    chunks.push(
      `${comment}export type ${
        descriptorProto.name
      } = {${EOL}${literalNode.join(EOL)}${EOL}};`,
    );
  } else {
    chunks.push(`${comment}export interface ${descriptorProto.name}{${EOL}};`);
  }

  chunks.push(...typeGuardFuncsForOneOf);
  return chunks.join(EOL);
};

export const generateEnum = (
  enumDescriptor: EnumDescriptorProto,
  options: Option,
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
  fileDescriptorProto: FileDescriptorProto,
  options: Option,
): Promise<string> => {
  const statements: string[] = ["/* eslint-disable */"];

  const enums = fileDescriptorProto.enum_type.flatMap((enumDescriptor) =>
    generateEnum(enumDescriptor, options),
  );
  const messages = fileDescriptorProto.message_type.flatMap(
    (messageDescriptor) =>
      generateMessage(
        {
          fileDescriptorProto,
          descriptorProto: messageDescriptor,
        },
        options,
      ),
  );

  statements.push(
    fileDescriptorProto.dependency
      .map((dependency) => {
        if (!fileDescriptorProto.name) return;
        if (!fileDescriptorProto?.package) return;

        const types = getMessageOrEnumWithPackages(fileDescriptorProto.package);
        if (!types?.length) return;
        return `import {${types.join(", ")}} from "${path.relative(
          path.dirname(fileDescriptorProto.name),
          removeFileExtension(dependency, ""),
        )}";`;
      })
      .join(EOL),
  );

  if (fileDescriptorProto.syntax) {
    statements.push(`export const syntax = "${fileDescriptorProto.syntax}";`);
  }
  if (fileDescriptorProto.package) {
    statements.push(
      `export const protocolBufferPackage = "${fileDescriptorProto.package}";`,
    );
  }

  statements.push(...enums, ...messages);

  return prettier.format(statements.join(EOL), {
    parser: "typescript",
  });
};
