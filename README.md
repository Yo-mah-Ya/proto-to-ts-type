# proto-to-ts-type

**This library will generate TypeScript types from `.proto` files.
This does not generate other features like binary serializing/deserializing, toJson/fromJson or other stuff like that.**

## The mapping rules of proto to TypeScript types

| proto    | TypeScript                          |
| -------- | ----------------------------------- |
| double   | number                              |
| float    | number                              |
| int32    | number                              |
| uint32   | number                              |
| sint32   | number                              |
| fixed32  | number                              |
| sfixed   | number                              |
| int64    | bigint                              |
| uint64   | bigint                              |
| sint64   | bigint                              |
| fixed64  | bigint                              |
| sfixed64 | bigint                              |
| string   | string                              |
| bool     | boolean                             |
| group    | `type_name` of FieldDescriptorProto |
| enum     | `type_name` of FieldDescriptorProto |
| message  | `type_name` of FieldDescriptorProto |

### dependencies

- plugin.proto
  https://github.com/protocolbuffers/protobuf/blob/main/src/google/protobuf/compiler/plugin.proto

- descriptor.proto
  https://github.com/protocolbuffers/protobuf/blob/main/src/google/protobuf/descriptor.proto
