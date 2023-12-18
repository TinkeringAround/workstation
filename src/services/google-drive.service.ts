import { google } from "googleapis";
import fs from "fs";
import path from "path";
import { LoggerService } from "./logger.service";
import { ConfigService } from "./config.service";

const CLIENT_EMAIL = ConfigService.get("GOOGLE_DRIVE_CLIENT_EMAIL") as string;
const PRIVATE_KEY = atob(
  ConfigService.get("GOOGLE_DRIVE_PRIVATE_KEY") as string
);
const UPLOAD_FOLDER_ID = ConfigService.get(
  "GOOGLE_DRIVE_UPLOAD_FOLDER_ID"
) as string;
const LOGGER = new LoggerService("GoogleDriveService");

export class GoogleDriveService {
  jwtClient;

  constructor() {
    this.jwtClient = new google.auth.JWT({
      email: CLIENT_EMAIL,
      key: PRIVATE_KEY,
      scopes: ["https://www.googleapis.com/auth/drive.file"],
    });
  }

  async getClient() {
    await this.jwtClient.authorize();
    return this.jwtClient;
  }

  async getDriveService(auth: any) {
    return google.drive({ version: "v3", auth });
  }

  // async listFiles() {
  //   this.getClient()
  //     .then(this.getDriveService)
  //     .then((driveService) => driveService.files.list())
  //     .catch(this.handleError);
  // }

  async upload(name: string, mimeType = "text/plain") {
    return this.getClient()
      .then(this.getDriveService)
      .then((driveService) => {
        LOGGER.log("Uploading File ", name);
        return driveService.files.create({
          fields: "id",
          requestBody: {
            name,
            parents: [UPLOAD_FOLDER_ID],
          },
          media: {
            mimeType,
            body: fs.createReadStream(path.join(process.cwd(), name)),
          },
        });
      })
      .catch(this.handleError)
      .finally(() => {
        LOGGER.log("Finished Uploading File ", name);
      });
  }

  // search = async (
  //   query = "mimeType='application/vnd.google-apps.folder'",
  //   fields = "files(id, name)"
  // ) => {
  //   return this.getClient()
  //     .then(this.getDriveService)
  //     .then((driveService) =>
  //       driveService.files.list({
  //         q: query,
  //         fields,
  //       })
  //     )
  //     .catch(this.handleError);
  // };

  handleError(error: any) {
    LOGGER.log(error);
  }
}
