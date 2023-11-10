const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const CLIENT_EMAIL = process.env.GOOGLE_DRIVE_CLIENT_EMAIL;
const PRIVATE_KEY = Buffer.from(
  process.env.GOOGLE_DRIVE_PRIVATE_KEY,
  "base64"
).toString("ascii");
const UPLOAD_FOLDER_ID = process.env.GOOGLE_DRIVE_UPLOAD_FOLDER_ID;

module.exports = class GoogleDriveService {
  constructor() {}

  async getClient() {
    const jwtClient = new google.auth.JWT(CLIENT_EMAIL, null, PRIVATE_KEY, [
      "https://www.googleapis.com/auth/drive.file",
    ]);

    await jwtClient.authorize();
    return jwtClient;
  }

  async getDriveService(auth) {
    return google.drive({ version: "v3", auth });
  }

  async listFiles() {
    this.getClient()
      .then(this.getDriveService)
      .then((driveService) => driveService.files.list())
      .catch(this.handleError);
  }

  async uploadFile(name, mimeType = "text/plain") {
    return this.getClient()
      .then(this.getDriveService)
      .then((driveService) =>
        driveService.files.create({
          fields: "id",
          resource: {
            name,
            parents: [UPLOAD_FOLDER_ID],
          },
          media: {
            mimeType,
            body: fs.createReadStream(path.join(process.cwd(), name)),
          },
        })
      )
      .catch(this.handleError);
  }

  search = async (
    query = "mimeType='application/vnd.google-apps.folder'",
    fields = "files(id, name)"
  ) => {
    return this.getClient()
      .then(this.getDriveService)
      .then((driveService) =>
        driveService.files.list({
          q: query,
          fields,
        })
      )
      .catch(this.handleError);
  };

  handleError(error) {
    console.error(error);
  }
};
