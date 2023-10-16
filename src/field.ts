import {
  FieldDescriptorProto,
  FieldDescriptorProto_Label,
  FieldDescriptorProto_Type,
  FileDescriptorProto,
} from "./protobuf/descriptor";

export const isOptional = (fieldDescriptor: FieldDescriptorProto): boolean =>
  fieldDescriptor.label === FieldDescriptorProto_Label.LABEL_OPTIONAL;

export const isRequired = (fieldDescriptor: FieldDescriptorProto): boolean =>
  fieldDescriptor.label === FieldDescriptorProto_Label.LABEL_REQUIRED;

export const isRepeated = (fieldDescriptor: FieldDescriptorProto): boolean =>
  fieldDescriptor.label === FieldDescriptorProto_Label.LABEL_REPEATED;

export const toTypeName = (
  fieldDescriptor: FieldDescriptorProto,
  fileDescriptorProto: FileDescriptorProto
): string => {
  fileDescriptorProto;
  switch (fieldDescriptor.type) {
    case FieldDescriptorProto_Type.TYPE_DOUBLE:
    case FieldDescriptorProto_Type.TYPE_FLOAT:
    case FieldDescriptorProto_Type.TYPE_INT32:
    case FieldDescriptorProto_Type.TYPE_UINT32:
    case FieldDescriptorProto_Type.TYPE_SINT32:
    case FieldDescriptorProto_Type.TYPE_FIXED32:
    case FieldDescriptorProto_Type.TYPE_SFIXED32:
      return isRepeated(fieldDescriptor) ? "number[]" : "number";
    case FieldDescriptorProto_Type.TYPE_INT64:
    case FieldDescriptorProto_Type.TYPE_UINT64:
    case FieldDescriptorProto_Type.TYPE_SINT64:
    case FieldDescriptorProto_Type.TYPE_FIXED64:
    case FieldDescriptorProto_Type.TYPE_SFIXED64:
      return isRepeated(fieldDescriptor) ? "bigint[]" : "bigint";
    case FieldDescriptorProto_Type.TYPE_STRING:
      return isRepeated(fieldDescriptor) ? "string[]" : "string";
    case FieldDescriptorProto_Type.TYPE_BOOL:
      return isRepeated(fieldDescriptor) ? "boolean[]" : "boolean";
    case FieldDescriptorProto_Type.TYPE_BYTES:
      return isRepeated(fieldDescriptor) ? "Uint8Array[]" : "Uint8Array";
    case FieldDescriptorProto_Type.TYPE_GROUP:
    case FieldDescriptorProto_Type.TYPE_ENUM:
    case FieldDescriptorProto_Type.TYPE_MESSAGE: {
      const typeName = fieldDescriptor.type_name.split(".").slice(-1).join("");
      return isRepeated(fieldDescriptor) ? `${typeName}[]` : typeName;
    }
    default: {
      const typeName = fieldDescriptor.type_name.split(".").slice(-1).join("");
      return isRepeated(fieldDescriptor) ? `${typeName}[]` : typeName;
    }
  }
};
