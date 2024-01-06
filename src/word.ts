import fs from "fs/promises";
import { xml2json } from "xml-js";
import { debug } from "./debug";
import zip from "adm-zip";

export async function readWord(file: string): Promise<string> {
  const word = await fs.readFile(file);
  const zipFile = new zip(word);
  const zipEntries = zipFile.getEntries();
  //if (debug()) console.log("zipEntries", zipEntries.length);
  let xml = "";

  for (let i = 0; i < zipEntries.length; i++) {
    if (zipEntries[i].entryName.match("word/document.xml"))
      xml = zipFile.readAsText(zipEntries[i]);
  }

  if (xml === "") throw new Error(`Word file ${file} has incorrect format`);
  const json = xml2json(xml);
  //if (debug()) console.log("Word file:\n", json);

  const strings: string[] = [];
  let text: string = "";
  function iterateElements(properties: any) {
    for (const key in properties) {
      //if (debug()) console.log(`key:`, key, properties[key]);
      if (key === "text") {
        strings.push(properties[key]);
        text += properties[key] + "\n";
      }

      switch (key) {
        case "elements":
          if (
            typeof properties[key] === "object" &&
            properties[key].length !== undefined
          ) {
            for (const element of properties[key]) {
              iterateElements(element);
            }
          }
          break;

        default:
          break;
      }
    }
  }
  try {
    iterateElements(JSON.parse(json));
  } catch (error) {
    console.error(`Error: ${error}`);
  }

  if (debug()) console.log("Word text:");
  if (debug()) console.log(text);
  return text;
}
