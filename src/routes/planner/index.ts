import { Router } from "express";
import { LoggerService } from "../../services/logger.service";
import { AppleReminder } from "../../model";
import { Planner } from "./planner";

const LOGGER = new LoggerService("/planner");

export default Router()
  .delete("/", async (_, res) => {
    try {
      await new Planner([]).clearTasks();
      return res.sendStatus(202);
    } catch (error) {
      LOGGER.log(error);
    }

    res.sendStatus(500);
  })
  .post("/", async (req, res) => {
    try {
      const reminders = req.body.reminders as AppleReminder[];

      if (reminders?.length > 0) {
        const planner = new Planner(reminders);
        const planoutSuccess = await planner.planTasks();

        if (planoutSuccess) {
          return res.sendStatus(200);
        }
      }

      return res.sendStatus(500);
    } catch (error) {
      LOGGER.log(error);
    }

    res.sendStatus(500);
  });
