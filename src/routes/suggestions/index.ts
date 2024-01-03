import { Router } from "express";
import { LoggerService } from "../../services/logger.service";
import { getSuggestions } from "./get-suggestions";
import { GoogleDriveService } from "../../services/google-drive.service";

const googleDriveService = new GoogleDriveService();
const LOGGER = LoggerService.init("/suggestions");

export const router: Router = Router().get("/suggestions", async (req, res) => {
  try {
    const search = (req.query.search as string)?.toLocaleLowerCase(); // format "text"
    const fileName = `${search}.txt`;

    if (search) {
      const fileExists = await googleDriveService.getIdIfExists(search, "file");

      if (fileExists) {
        LOGGER.log(
          `Suggestion file for search ${search} already present, skipping...`
        );
        return res.status(200).send(fileName);
      }

      const totalHits = getSuggestions(search);
      const id = await googleDriveService.create(fileName, totalHits);

      if (id) {
        return res.status(201).send(fileName);
      }
    }
  } catch (error) {
    LOGGER.log(error);
  }

  res.sendStatus(500);
});
