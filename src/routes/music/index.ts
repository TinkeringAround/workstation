import { Router } from "express";
import { router as samplesRouter } from "./samples";
import { router as suggestionsRouter } from "./suggestions";

export default Router().use("", samplesRouter).use("", suggestionsRouter);
