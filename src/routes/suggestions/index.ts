import { Router } from "express";
import { LoggerService } from "../../services/logger.service";
import { getSuggestions } from "./get-suggestions";

export const router: Router = Router();

router.get("/suggestions", (req, res) => {
  try {
    const search = req.query.search as string; // format "text"

    if (search) {
      const hits = getSuggestions(search.toLocaleLowerCase());
      return res.status(200).send(hits);
    }

    res.sendStatus(500);
  } catch (error) {
    LoggerService.init("/suggestions").log(error);
    res.sendStatus(500);
  }
});
