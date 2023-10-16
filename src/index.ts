#!/usr/bin/env node
import { readFileSync } from "fs";
import { generateFile } from "./main";
import { FileDescriptorProto } from "./protobuf/descriptor";
import {
  CodeGeneratorRequest,
  CodeGeneratorResponse,
  CodeGeneratorResponse_Feature,
} from "./protobuf/plugin";
import { promisify } from "util";
import { toOptions } from "./option";

const main = async (): Promise<void> => {
  const request = CodeGeneratorRequest.decode(new Uint8Array(readFileSync(0)));
  const options = toOptions(request.parameter);

  const files = await Promise.all(
    request.proto_file.map(
      async (
        fileDescriptor: FileDescriptorProto
      ): Promise<{ name: string; content: string }> => ({
        name: fileDescriptor?.name?.replace(".proto", ".ts") ?? "",
        content: await generateFile(fileDescriptor, options),
      })
    )
  );
  const response = CodeGeneratorResponse.fromPartial({
    file: files,
    supported_features: CodeGeneratorResponse_Feature.FEATURE_PROTO3_OPTIONAL,
  });
  const buffer = CodeGeneratorResponse.encode(response).finish();
  await promisify(
    // eslint-disable-next-line @typescript-eslint/unbound-method
    process.stdout.write as (buffer: Buffer) => boolean
  ).bind(process.stdout)(Buffer.from(buffer));
};

main().catch(console.error);
