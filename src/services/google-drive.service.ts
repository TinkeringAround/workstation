import { google } from "googleapis";
import { LoggerService } from "./logger.service";
import { ConfigService } from "./config.service";
import { FileService } from "./file.service";

const LOGGER = new LoggerService("Google-Drive-Service");

export class GoogleDriveService {
  jwtClient;
  static IDS: string[] = [];

  constructor() {
    this.jwtClient = new google.auth.JWT({
      email: ConfigService.get("GOOGLE_DRIVE_CLIENT_EMAIL") as string,
      key: atob(ConfigService.get("GOOGLE_DRIVE_PRIVATE_KEY") as string),
      scopes: ["https://www.googleapis.com/auth/drive.file"],
    });
  }

  async getClient() {
    await this.jwtClient?.authorize();
    return this.jwtClient;
  }

  async getDriveService(auth: any) {
    return google.drive({ version: "v3", auth });
  }

  async getId() {
    if (GoogleDriveService.IDS.length == 0) {
      LOGGER.log("Fetching new Ids...");
      const ids = await this.getClient()
        .then(this.getDriveService)
        .then((driveService) =>
          driveService.files.generateIds({
            count: 1000,
          })
        )
        .then((response) => response?.data?.ids ?? [])
        .catch((error) => {
          LOGGER.log(error);
          return null;
        });

      LOGGER.log(`-> got ${ids?.length} new ids`);
      if (ids) {
        GoogleDriveService.IDS.push(...ids);
      } else {
        return null;
      }
    }

    return GoogleDriveService.IDS.pop();
  }

  // async existsWithId(fileId: string) {
  //   return await new Promise(async (resolve) => {
  //     this.getClient()
  //       .then(this.getDriveService)
  //       .then(async (driveService) => {
  //         // Check file exists in Google Drive
  //         const fileMetaData = await driveService.files
  //           .get({
  //             fileId,

  //             fields: "name",
  //           })
  //           .catch((error) => {
  //             LOGGER.log(error);
  //           });

  //         // If not existent - return null -> 404
  //         const fileName = fileMetaData?.data?.name;
  //         if (!fileName) {
  //           LOGGER.log("No file found");
  //           return resolve(false);
  //         }

  //         resolve(true);
  //       });
  //   });
  // }

  async getIdIfExists(name: string, type: "file" | "folder") {
    LOGGER.log("Checking for file with name ", name);
    const files =
      (await this.getClient()
        .then(this.getDriveService)
        .then((driveService) =>
          driveService.files.list({
            orderBy: "name",
            pageSize: 1000,
            q: `'${ConfigService.get(
              "GOOGLE_DRIVE_UPLOAD_FOLDER_ID"
            )}' in parents and trashed=false`,
          })
        )
        .then((response) => response?.data?.files)
        .catch(this.handleError)) ?? [];

    const id = files
      ?.filter((file) =>
        type == "folder"
          ? file.mimeType?.includes("folder")
          : !file.mimeType?.includes("folder")
      )
      .find((file) =>
        type === "folder" ? file.name === name : file.name?.includes(name)
      )?.id;
    this.logId(id);
    return id;
  }

  async listFiles() {
    return this.getClient()
      .then(this.getDriveService)
      .then((driveService) =>
        driveService.files.list({
          orderBy: "modifiedTime desc",
          pageSize: 1000,
          q: `'${ConfigService.get(
            "GOOGLE_DRIVE_UPLOAD_FOLDER_ID"
          )}' in parents and trashed=false`,
        })
      )
      .catch(this.handleError);
  }

  async createFolder(name: string) {
    const id = await this.getId();

    if (!id) {
      return null;
    }

    LOGGER.log("Creating Folder with id ", id);
    return this.getClient()
      .then(this.getDriveService)
      .then(async (driveService) =>
        driveService.files.create({
          fields: "id",
          requestBody: {
            name,
            id,
            parents: [
              ConfigService.get("GOOGLE_DRIVE_UPLOAD_FOLDER_ID") as string,
            ],
            mimeType: "application/vnd.google-apps.folder",
          },
        })
      )
      .then((response) => response.data.id)
      .then(this.logId)
      .catch(this.handleError);
  }

  async createFromUrl(
    name: string,
    url: string,
    mimeType = "text/plain",
    folderId: string
  ) {
    LOGGER.log("Uploading File ", name, " from url ", url);

    return this.getClient()
      .then(this.getDriveService)
      .then(async (driveService) =>
        driveService.files.create({
          fields: "id",
          requestBody: {
            name,
            parents: [folderId],
          },
          media: {
            mimeType,
            body: await FileService.streamFromUrl(url),
          },
        })
      )
      .then((response) => response?.data?.id)
      .then(this.logId)
      .catch(this.handleError);
  }

  async create(
    name: string,
    body: string,
    mimeType = "text/plain",
    folderId: string = ConfigService.get("GOOGLE_DRIVE_UPLOAD_FOLDER_ID")
  ) {
    LOGGER.log("Uploading File ", name);

    return this.getClient()
      .then(this.getDriveService)
      .then(async (driveService) =>
        driveService.files.create({
          fields: "id",
          requestBody: {
            name,
            parents: [folderId],
          },
          media: {
            mimeType,
            body,
          },
        })
      )
      .then((response) => response?.data?.id)
      .then(this.logId)
      .catch(this.handleError);
  }

  logId(id: any) {
    LOGGER.log(`-> ${id}`);
    return id;
  }

  handleError(error: any) {
    LOGGER.log(error);
  }
}
