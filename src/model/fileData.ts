export type FileType = "account" | "nft" | "request" | "map" | "answer";

export interface FileData {
  filename: string;
  type: FileType;
  timestamp: number;
  iv?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
}
