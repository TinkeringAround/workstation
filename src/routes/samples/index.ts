import { Router } from "express";
import { getSamples } from "./get-samples";
import { LoggerService } from "../../services/logger.service";
import { UtilService } from "../../services/util.service";
import { GoogleDriveService } from "../../services/google-drive.service";
import { FileService } from "../../services/file.service";

export const router: Router = Router();
const googleDriveService = new GoogleDriveService();

router.get("/samples", async (req, res) => {
  try {
    const search = req.query.search as string; // format "text+text"

    if (search) {
      const samples = await getSamples(search);
      return res.status(200).send(samples);
    }

    res.sendStatus(500);
  } catch (error) {
    LoggerService.init("/samples").log(error);
    res.sendStatus(500);
  }
});

router.post("/samples/save", async (req, res) => {
  try {
    const audios = req.body.audios as string[];
    const search = req.body.search as string;

    if (audios && search) {
      for (let i = 0; i < audios.length; i++) {
        const name = `${UtilService.getTimestamp()}-${search}-${i}.mp3`;
        FileService.download({
          url: audios[i],
          name,
        });
        await googleDriveService.upload(name, "audio/mpeg");
        FileService.delete(name);
      }
      return res.sendStatus(200);
    }

    res.sendStatus(500);
  } catch (error) {
    LoggerService.init("/samples/save").log(error);
    res.sendStatus(500);
  }
});
