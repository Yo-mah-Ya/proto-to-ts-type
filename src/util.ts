export const removeFileExtension = (f: string, extension: string): string =>
  f.replace(/\.[^.]+$/, extension);
export const removeProtoFileExtension = (f: string): string =>
  removeFileExtension(f, ".proto");
export const removeTsFileExtension = (f: string): string =>
  removeFileExtension(f, ".ts");
