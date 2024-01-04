export type FileType =
  | "account"
  | "name"
  | "nft"
  | "request"
  | "map"
  | "result"
  | "proof"
  | "mask"
  | "jwt";

export interface FileData {
  filename: string;
  type: FileType;
  timestamp: number;
  iv?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
}

export type FileEncoding = "text" | "binary";
