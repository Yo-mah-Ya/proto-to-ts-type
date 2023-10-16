/* eslint-disable */
import * as _m0 from "protobufjs/minimal";
import { FileDescriptorProto, GeneratedCodeInfo } from "./descriptor";
import Long = require("long");

export const protobufPackage = "google.protobuf.compiler";

/** The version number of protocol compiler. */
export interface Version {
  major: number;
  minor: number;
  patch: number;
  /**
   * A suffix for alpha, beta or rc release, e.g., "alpha-1", "rc2". It should
   * be empty for mainline stable releases.
   */
  suffix: string;
}

/** An encoded CodeGeneratorRequest is written to the plugin's stdin. */
export interface CodeGeneratorRequest {
  /**
   * The .proto files that were explicitly listed on the command-line.  The
   * code generator should generate code only for these files.  Each file's
   * descriptor will be included in proto_file, below.
   */
  file_to_generate: string[];
  /** The generator parameter passed on the command-line. */
  parameter: string;
  /**
   * FileDescriptorProtos for all files in files_to_generate and everything
   * they import.  The files will appear in topological order, so each file
   * appears before any file that imports it.
   *
   * Note: the files listed in files_to_generate will include runtime-retention
   * options only, but all other files will include source-retention options.
   * The source_file_descriptors field below is available in case you need
   * source-retention options for files_to_generate.
   *
   * protoc guarantees that all proto_files will be written after
   * the fields above, even though this is not technically guaranteed by the
   * protobuf wire format.  This theoretically could allow a plugin to stream
   * in the FileDescriptorProtos and handle them one by one rather than read
   * the entire set into memory at once.  However, as of this writing, this
   * is not similarly optimized on protoc's end -- it will store all fields in
   * memory at once before sending them to the plugin.
   *
   * Type names of fields and extensions in the FileDescriptorProto are always
   * fully qualified.
   */
  proto_file: FileDescriptorProto[];
  /**
   * File descriptors with all options, including source-retention options.
   * These descriptors are only provided for the files listed in
   * files_to_generate.
   */
  source_file_descriptors: FileDescriptorProto[];
  /** The version number of protocol compiler. */
  compiler_version: Version | undefined;
}

/** The plugin writes an encoded CodeGeneratorResponse to stdout. */
export interface CodeGeneratorResponse {
  /**
   * Error message.  If non-empty, code generation failed.  The plugin process
   * should exit with status code zero even if it reports an error in this way.
   *
   * This should be used to indicate errors in .proto files which prevent the
   * code generator from generating correct code.  Errors which indicate a
   * problem in protoc itself -- such as the input CodeGeneratorRequest being
   * unparseable -- should be reported by writing a message to stderr and
   * exiting with a non-zero status code.
   */
  error: string;
  /**
   * A bitmask of supported features that the code generator supports.
   * This is a bitwise "or" of values from the Feature enum.
   */
  supported_features: number;
  file: CodeGeneratorResponse_File[];
}

/** Sync with code_generator.h. */
export enum CodeGeneratorResponse_Feature {
  FEATURE_NONE = 0,
  FEATURE_PROTO3_OPTIONAL = 1,
  FEATURE_SUPPORTS_EDITIONS = 2,
  UNRECOGNIZED = -1,
}

export function codeGeneratorResponse_FeatureFromJSON(object: any): CodeGeneratorResponse_Feature {
  switch (object) {
    case 0:
    case "FEATURE_NONE":
      return CodeGeneratorResponse_Feature.FEATURE_NONE;
    case 1:
    case "FEATURE_PROTO3_OPTIONAL":
      return CodeGeneratorResponse_Feature.FEATURE_PROTO3_OPTIONAL;
    case 2:
    case "FEATURE_SUPPORTS_EDITIONS":
      return CodeGeneratorResponse_Feature.FEATURE_SUPPORTS_EDITIONS;
    case -1:
    case "UNRECOGNIZED":
    default:
      return CodeGeneratorResponse_Feature.UNRECOGNIZED;
  }
}

export function codeGeneratorResponse_FeatureToJSON(object: CodeGeneratorResponse_Feature): string {
  switch (object) {
    case CodeGeneratorResponse_Feature.FEATURE_NONE:
      return "FEATURE_NONE";
    case CodeGeneratorResponse_Feature.FEATURE_PROTO3_OPTIONAL:
      return "FEATURE_PROTO3_OPTIONAL";
    case CodeGeneratorResponse_Feature.FEATURE_SUPPORTS_EDITIONS:
      return "FEATURE_SUPPORTS_EDITIONS";
    case CodeGeneratorResponse_Feature.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

/** Represents a single generated file. */
export interface CodeGeneratorResponse_File {
  /**
   * The file name, relative to the output directory.  The name must not
   * contain "." or ".." components and must be relative, not be absolute (so,
   * the file cannot lie outside the output directory).  "/" must be used as
   * the path separator, not "\".
   *
   * If the name is omitted, the content will be appended to the previous
   * file.  This allows the generator to break large files into small chunks,
   * and allows the generated text to be streamed back to protoc so that large
   * files need not reside completely in memory at one time.  Note that as of
   * this writing protoc does not optimize for this -- it will read the entire
   * CodeGeneratorResponse before writing files to disk.
   */
  name: string;
  /**
   * If non-empty, indicates that the named file should already exist, and the
   * content here is to be inserted into that file at a defined insertion
   * point.  This feature allows a code generator to extend the output
   * produced by another code generator.  The original generator may provide
   * insertion points by placing special annotations in the file that look
   * like:
   *   @@protoc_insertion_point(NAME)
   * The annotation can have arbitrary text before and after it on the line,
   * which allows it to be placed in a comment.  NAME should be replaced with
   * an identifier naming the point -- this is what other generators will use
   * as the insertion_point.  Code inserted at this point will be placed
   * immediately above the line containing the insertion point (thus multiple
   * insertions to the same point will come out in the order they were added).
   * The double-@ is intended to make it unlikely that the generated code
   * could contain things that look like insertion points by accident.
   *
   * For example, the C++ code generator places the following line in the
   * .pb.h files that it generates:
   *   // @@protoc_insertion_point(namespace_scope)
   * This line appears within the scope of the file's package namespace, but
   * outside of any particular class.  Another plugin can then specify the
   * insertion_point "namespace_scope" to generate additional classes or
   * other declarations that should be placed in this scope.
   *
   * Note that if the line containing the insertion point begins with
   * whitespace, the same whitespace will be added to every line of the
   * inserted text.  This is useful for languages like Python, where
   * indentation matters.  In these languages, the insertion point comment
   * should be indented the same amount as any inserted code will need to be
   * in order to work correctly in that context.
   *
   * The code generator that generates the initial file and the one which
   * inserts into it must both run as part of a single invocation of protoc.
   * Code generators are executed in the order in which they appear on the
   * command line.
   *
   * If |insertion_point| is present, |name| must also be present.
   */
  insertion_point: string;
  /** The file contents. */
  content: string;
  /**
   * Information describing the file content being inserted. If an insertion
   * point is used, this information will be appropriately offset and inserted
   * into the code generation metadata for the generated files.
   */
  generated_code_info: GeneratedCodeInfo | undefined;
}

function createBaseVersion(): Version {
  return { major: 0, minor: 0, patch: 0, suffix: "" };
}

export const Version = {
  encode(message: Version, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.major !== 0) {
      writer.uint32(8).int32(message.major);
    }
    if (message.minor !== 0) {
      writer.uint32(16).int32(message.minor);
    }
    if (message.patch !== 0) {
      writer.uint32(24).int32(message.patch);
    }
    if (message.suffix !== "") {
      writer.uint32(34).string(message.suffix);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Version {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseVersion();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.major = reader.int32();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.minor = reader.int32();
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.patch = reader.int32();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.suffix = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Version {
    return {
      major: isSet(object.major) ? globalThis.Number(object.major) : 0,
      minor: isSet(object.minor) ? globalThis.Number(object.minor) : 0,
      patch: isSet(object.patch) ? globalThis.Number(object.patch) : 0,
      suffix: isSet(object.suffix) ? globalThis.String(object.suffix) : "",
    };
  },

  toJSON(message: Version): unknown {
    const obj: any = {};
    if (message.major !== 0) {
      obj.major = Math.round(message.major);
    }
    if (message.minor !== 0) {
      obj.minor = Math.round(message.minor);
    }
    if (message.patch !== 0) {
      obj.patch = Math.round(message.patch);
    }
    if (message.suffix !== "") {
      obj.suffix = message.suffix;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<Version>, I>>(base?: I): Version {
    return Version.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<Version>, I>>(object: I): Version {
    const message = createBaseVersion();
    message.major = object.major ?? 0;
    message.minor = object.minor ?? 0;
    message.patch = object.patch ?? 0;
    message.suffix = object.suffix ?? "";
    return message;
  },
};

function createBaseCodeGeneratorRequest(): CodeGeneratorRequest {
  return {
    file_to_generate: [],
    parameter: "",
    proto_file: [],
    source_file_descriptors: [],
    compiler_version: undefined,
  };
}

export const CodeGeneratorRequest = {
  encode(message: CodeGeneratorRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.file_to_generate) {
      writer.uint32(10).string(v!);
    }
    if (message.parameter !== "") {
      writer.uint32(18).string(message.parameter);
    }
    for (const v of message.proto_file) {
      FileDescriptorProto.encode(v!, writer.uint32(122).fork()).ldelim();
    }
    for (const v of message.source_file_descriptors) {
      FileDescriptorProto.encode(v!, writer.uint32(138).fork()).ldelim();
    }
    if (message.compiler_version !== undefined) {
      Version.encode(message.compiler_version, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): CodeGeneratorRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCodeGeneratorRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.file_to_generate.push(reader.string());
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.parameter = reader.string();
          continue;
        case 15:
          if (tag !== 122) {
            break;
          }

          message.proto_file.push(FileDescriptorProto.decode(reader, reader.uint32()));
          continue;
        case 17:
          if (tag !== 138) {
            break;
          }

          message.source_file_descriptors.push(FileDescriptorProto.decode(reader, reader.uint32()));
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.compiler_version = Version.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): CodeGeneratorRequest {
    return {
      file_to_generate: globalThis.Array.isArray(object?.file_to_generate)
        ? object.file_to_generate.map((e: any) => globalThis.String(e))
        : [],
      parameter: isSet(object.parameter) ? globalThis.String(object.parameter) : "",
      proto_file: globalThis.Array.isArray(object?.proto_file)
        ? object.proto_file.map((e: any) => FileDescriptorProto.fromJSON(e))
        : [],
      source_file_descriptors: globalThis.Array.isArray(object?.source_file_descriptors)
        ? object.source_file_descriptors.map((e: any) => FileDescriptorProto.fromJSON(e))
        : [],
      compiler_version: isSet(object.compiler_version) ? Version.fromJSON(object.compiler_version) : undefined,
    };
  },

  toJSON(message: CodeGeneratorRequest): unknown {
    const obj: any = {};
    if (message.file_to_generate?.length) {
      obj.file_to_generate = message.file_to_generate;
    }
    if (message.parameter !== "") {
      obj.parameter = message.parameter;
    }
    if (message.proto_file?.length) {
      obj.proto_file = message.proto_file.map((e) => FileDescriptorProto.toJSON(e));
    }
    if (message.source_file_descriptors?.length) {
      obj.source_file_descriptors = message.source_file_descriptors.map((e) => FileDescriptorProto.toJSON(e));
    }
    if (message.compiler_version !== undefined) {
      obj.compiler_version = Version.toJSON(message.compiler_version);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<CodeGeneratorRequest>, I>>(base?: I): CodeGeneratorRequest {
    return CodeGeneratorRequest.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<CodeGeneratorRequest>, I>>(object: I): CodeGeneratorRequest {
    const message = createBaseCodeGeneratorRequest();
    message.file_to_generate = object.file_to_generate?.map((e) => e) || [];
    message.parameter = object.parameter ?? "";
    message.proto_file = object.proto_file?.map((e) => FileDescriptorProto.fromPartial(e)) || [];
    message.source_file_descriptors = object.source_file_descriptors?.map((e) => FileDescriptorProto.fromPartial(e)) ||
      [];
    message.compiler_version = (object.compiler_version !== undefined && object.compiler_version !== null)
      ? Version.fromPartial(object.compiler_version)
      : undefined;
    return message;
  },
};

function createBaseCodeGeneratorResponse(): CodeGeneratorResponse {
  return { error: "", supported_features: 0, file: [] };
}

export const CodeGeneratorResponse = {
  encode(message: CodeGeneratorResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.error !== "") {
      writer.uint32(10).string(message.error);
    }
    if (message.supported_features !== 0) {
      writer.uint32(16).uint64(message.supported_features);
    }
    for (const v of message.file) {
      CodeGeneratorResponse_File.encode(v!, writer.uint32(122).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): CodeGeneratorResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCodeGeneratorResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.error = reader.string();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.supported_features = longToNumber(reader.uint64() as Long);
          continue;
        case 15:
          if (tag !== 122) {
            break;
          }

          message.file.push(CodeGeneratorResponse_File.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): CodeGeneratorResponse {
    return {
      error: isSet(object.error) ? globalThis.String(object.error) : "",
      supported_features: isSet(object.supported_features) ? globalThis.Number(object.supported_features) : 0,
      file: globalThis.Array.isArray(object?.file)
        ? object.file.map((e: any) => CodeGeneratorResponse_File.fromJSON(e))
        : [],
    };
  },

  toJSON(message: CodeGeneratorResponse): unknown {
    const obj: any = {};
    if (message.error !== "") {
      obj.error = message.error;
    }
    if (message.supported_features !== 0) {
      obj.supported_features = Math.round(message.supported_features);
    }
    if (message.file?.length) {
      obj.file = message.file.map((e) => CodeGeneratorResponse_File.toJSON(e));
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<CodeGeneratorResponse>, I>>(base?: I): CodeGeneratorResponse {
    return CodeGeneratorResponse.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<CodeGeneratorResponse>, I>>(object: I): CodeGeneratorResponse {
    const message = createBaseCodeGeneratorResponse();
    message.error = object.error ?? "";
    message.supported_features = object.supported_features ?? 0;
    message.file = object.file?.map((e) => CodeGeneratorResponse_File.fromPartial(e)) || [];
    return message;
  },
};

function createBaseCodeGeneratorResponse_File(): CodeGeneratorResponse_File {
  return { name: "", insertion_point: "", content: "", generated_code_info: undefined };
}

export const CodeGeneratorResponse_File = {
  encode(message: CodeGeneratorResponse_File, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.name !== "") {
      writer.uint32(10).string(message.name);
    }
    if (message.insertion_point !== "") {
      writer.uint32(18).string(message.insertion_point);
    }
    if (message.content !== "") {
      writer.uint32(122).string(message.content);
    }
    if (message.generated_code_info !== undefined) {
      GeneratedCodeInfo.encode(message.generated_code_info, writer.uint32(130).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): CodeGeneratorResponse_File {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCodeGeneratorResponse_File();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.name = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.insertion_point = reader.string();
          continue;
        case 15:
          if (tag !== 122) {
            break;
          }

          message.content = reader.string();
          continue;
        case 16:
          if (tag !== 130) {
            break;
          }

          message.generated_code_info = GeneratedCodeInfo.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): CodeGeneratorResponse_File {
    return {
      name: isSet(object.name) ? globalThis.String(object.name) : "",
      insertion_point: isSet(object.insertion_point) ? globalThis.String(object.insertion_point) : "",
      content: isSet(object.content) ? globalThis.String(object.content) : "",
      generated_code_info: isSet(object.generated_code_info)
        ? GeneratedCodeInfo.fromJSON(object.generated_code_info)
        : undefined,
    };
  },

  toJSON(message: CodeGeneratorResponse_File): unknown {
    const obj: any = {};
    if (message.name !== "") {
      obj.name = message.name;
    }
    if (message.insertion_point !== "") {
      obj.insertion_point = message.insertion_point;
    }
    if (message.content !== "") {
      obj.content = message.content;
    }
    if (message.generated_code_info !== undefined) {
      obj.generated_code_info = GeneratedCodeInfo.toJSON(message.generated_code_info);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<CodeGeneratorResponse_File>, I>>(base?: I): CodeGeneratorResponse_File {
    return CodeGeneratorResponse_File.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<CodeGeneratorResponse_File>, I>>(object: I): CodeGeneratorResponse_File {
    const message = createBaseCodeGeneratorResponse_File();
    message.name = object.name ?? "";
    message.insertion_point = object.insertion_point ?? "";
    message.content = object.content ?? "";
    message.generated_code_info = (object.generated_code_info !== undefined && object.generated_code_info !== null)
      ? GeneratedCodeInfo.fromPartial(object.generated_code_info)
      : undefined;
    return message;
  },
};

type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;

export type DeepPartial<T> = T extends Builtin ? T
  : T extends globalThis.Array<infer U> ? globalThis.Array<DeepPartial<U>>
  : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>>
  : T extends {} ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

type KeysOfUnion<T> = T extends T ? keyof T : never;
export type Exact<P, I extends P> = P extends Builtin ? P
  : P & { [K in keyof P]: Exact<P[K], I[K]> } & { [K in Exclude<keyof I, KeysOfUnion<P>>]: never };

function longToNumber(long: Long): number {
  if (long.gt(globalThis.Number.MAX_SAFE_INTEGER)) {
    throw new globalThis.Error("Value is larger than Number.MAX_SAFE_INTEGER");
  }
  return long.toNumber();
}

if (_m0.util.Long !== Long) {
  _m0.util.Long = Long as any;
  _m0.configure();
}

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}
