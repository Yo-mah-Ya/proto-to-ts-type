# proto-to-ts-type

**This library will generate TypeScript types from `.proto` files.
This does not generate other features like binary serializing/deserializing, toJson/fromJson or other stuff like that.**

## how to use

1. install package

```sh
yarn add --dev proto-to-ts-type
```

2. execute [`protoc`](https://protobuf.dev/downloads/) command

- without option

```sh
protoc \
  --plugin="./node_modules/.bin/protoc-gen-ts-type" \
  --ts-type_out=. \
  proto.proto
```

- with options

For example, If you'd like to generate `json_name` defined in protofiles as TS type fields and enum as string, execute the following command.

Each the pair of key and value is supposed to be delimited by equal sign `=`, and comma `,` for each parameters.

```sh
protoc \
  --plugin="./node_modules/.bin/protoc-gen-ts-type" \
  --ts-type_out=. \
  --ts-type_opt=useJsonName=true,enumValueAsString=true \
  proto.proto
```

## Available option

Check in `src/option.ts`.

| key               | value          |                                                                                  |
| ----------------- | -------------- | -------------------------------------------------------------------------------- |
| useJsonName       | `true`/`false` | `json_name` in a proto file would be used.                                       |
| enumValueAsString | `true`/`false` | Enum value would be same as member names instead of numbers, which starts with 0 |

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
