import dotenv from "dotenv";
dotenv.config();

export type ConfigKey =
  | "GOOGLE_DRIVE_CLIENT_EMAIL"
  | "GOOGLE_DRIVE_PRIVATE_KEY"
  | "GOOGLE_DRIVE_UPLOAD_FOLDER_ID"
  | "GOOGLE_DRIVE_CALENDAR_ID"
  | "GOOGLE_DRIVE_CALENDAR_ID_TASKS";

export class ConfigService {
  static get<T = string>(key: ConfigKey) {
    return process.env[key] as T;
  }
}
