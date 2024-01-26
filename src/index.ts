import express, { Response } from "express";
import os from "os";

// Services
import { LoggerService } from "./services/logger.service";

// Routes
import musicRouter from "./routes/music";
import plannerRouter from "./routes/planner";

// Variables
const LOGGER = new LoggerService("index");
const ERRORS: any[] = [];

const initApp = () => {
  try {
    express()
      .use(express.json())
      .use("/v1/music", musicRouter)
      .use("/v1/planner", plannerRouter)
      .use("/health", (_, res: Response) =>
        res.status(200).send({
          errors: ERRORS,
        })
      )
      // 404
      .use((req, res) => {
        ERRORS.push(`NON-EXISTING RESOURCE "${req.url}"`);
        return res.sendStatus(404);
      })
      .listen(3000, () => {
        LOGGER.log(
          `⚡️[server]: Server is running on PORT 3000 on architecture ${os.arch()}`
        );
      });
  } catch (error: any) {
    LOGGER.log(error);
    ERRORS.push({ time: new Date(), error });

    initApp();
  }
};

initApp();
