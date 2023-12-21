import dotenv from "dotenv";
dotenv.config();

export type ConfigKey =
  | "GOOGLE_DRIVE_CLIENT_EMAIL"
  | "GOOGLE_DRIVE_PRIVATE_KEY"
  | "GOOGLE_DRIVE_UPLOAD_FOLDER_ID";

export class ConfigService {
  static get(key: ConfigKey) {
    return process.env[key];
  }
}
