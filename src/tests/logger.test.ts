import { describe, it } from "node:test";
import assert from "node:assert";

import { LoggerService } from "../services/logger.service";

describe("LoggerService", () => {
  it("should create when init is called", () => {
    const loggerName = "BLA-BLA";
    const message = "Nachricht";
    let printedMessage: string = "";

    console.log = (...messages: string[]) => {
      printedMessage = messages.join(" ");
    };

    const logger = LoggerService.init(loggerName);
    logger.log(message);

    assert.ok(printedMessage.includes(message));
    assert.ok(printedMessage.includes(loggerName));
  });

  it("should log to console when log is called", () => {
    const loggerName = "TEST";
    const message = "message";
    let printedMessage: string = "";

    console.log = (...messages: string[]) => {
      printedMessage = messages.join(" ");
    };

    const logger = new LoggerService(loggerName);
    logger.log(message);

    assert.ok(printedMessage.includes(message));
    assert.ok(printedMessage.includes(loggerName));
  });
});
