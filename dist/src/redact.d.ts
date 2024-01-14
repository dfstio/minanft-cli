import { RedactedFileEncoding } from "./model/fileData";
import { MaskData } from "./model/maskData";
export declare function redact(name: string, mask: string, type: RedactedFileEncoding): Promise<void>;
export declare function redactText(originalText: string, mask: string): Promise<string>;
export declare function loadMask(mask: string): Promise<MaskData[]>;
