import { Router } from "express";
import { getSamples } from "./get-samples";
import { LoggerService } from "../../services/logger.service";
import { GoogleDriveService } from "../../services/google-drive.service";

const googleDriveService = new GoogleDriveService();
const LOGGER = new LoggerService("/samples");

export const router = Router().get("/samples", async (req, res) => {
  try {
    const search = (req.query.search as string)
      .split(" ")
      .join("+")
      .toLocaleLowerCase(); // format "text+text"

    if (search) {
      const folderExists = await googleDriveService.getIdIfExists(
        search,
        "folder"
      );

      if (folderExists) {
        LOGGER.log("Folder already exists, skipping.");
        return res.status(200).send(search);
      }

      const folderId = await googleDriveService.createFolder(search);
      if (folderId) {
        const samples = await getSamples(search);
        for (let i = 0; i < samples.length; i++) {
          const { url, id } = samples[i];
          await googleDriveService.createFromUrl(
            `${id}.mp3`,
            url,
            "audio/mpeg",
            folderId
          );
        }

        return res.status(200).send(search);
      }
    }
  } catch (error) {
    LOGGER.log(error);
  }

  res.sendStatus(500);
});
