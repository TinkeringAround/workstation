import express, { Response } from "express";

// Services
import { ConfigService } from "./services/config.service";
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
      .listen(ConfigService.get("PORT"), () => {
        Logger.log(`⚡️[server]: Server is running`);
      });
  } catch (error: any) {
    Logger.log(error);
    ERRORS.push(error);

    initApp();
  }
};

initApp();
