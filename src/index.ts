import express, { Response } from "express";
import os from "os";

// Services
import { LoggerService } from "./services/logger.service";

// Routes
import { router as samplesRouter } from "./routes/samples";
import { router as suggestionsRouter } from "./routes/suggestions";

// Variables
const Logger = new LoggerService("index");
const ERRORS: any[] = [];

const initApp = () => {
  try {
    express()
      .use(express.json())
      .use("/v1", samplesRouter)
      .use("/v1", suggestionsRouter)
      .use("/health", (_, res: Response) => {
        return res.status(200).send({
          errors: ERRORS,
        });
      })
      .use((req, res) => {
        ERRORS.push(`NON-EXISTING RESOURCE "${req.url}"`);
        return res.sendStatus(500);
      })
      .listen(3000, () => {
        Logger.log(
          `⚡️[server]: Server is running on PORT 3000 with architecture ${os.arch()}`
        );
      });
  } catch (error: any) {
    Logger.log(error);
    ERRORS.push(error);

    initApp();
  }
};

initApp();
