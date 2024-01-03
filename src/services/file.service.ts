import CP from "child_process";
import fs from "fs";
import { Readable } from "stream";

import { LoggerService } from "./logger.service";
import { Downloadable } from "../model";

const Logger = new LoggerService("FileService");

export class FileService {
  static download({ name, url }: Downloadable) {
    Logger.log("Downloading File... ", name, url);
    CP.execSync(`curl -o ${name} '${url}'`);
  }

  static delete(name: string) {
    Logger.log("Deleting File... ", name);
    fs.unlinkSync(name);
  }

  static async streamFromUrl(url: string) {
    return await fetch(url).then(({ body }) =>
      // @ts-ignore
      Readable.fromWeb(body)
    );
  }
}
