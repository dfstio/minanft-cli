import { MaskData } from "./model/maskData";
export declare function redactpng(name: string, masks: MaskData[], redactedFilename: string): Promise<void>;
export declare function pngFoFields(filename: string): Promise<import("o1js/dist/node/lib/field").Field[]>;
