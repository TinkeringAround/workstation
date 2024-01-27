import assert from "node:assert";

import { TimeService } from "../services/time.service";
import { describe, it } from "node:test";

describe("TimeService", () => {
  it("should return todays date", () => {
    const today = TimeService.toDateString(new Date());
    assert.ok(TimeService.isDate(today, TimeService.today));
  });

  it("should return tomorrows date", () => {
    const today = new Date(TimeService.today);
    const tomorrow = new Date(TimeService.tomorrow);

    assert.equal(TimeService.getMinutesInBetween(tomorrow, today), 24 * 60);
  });

  it("should return next weeks date", () => {
    const today = new Date(TimeService.today);
    const nextWeek = new Date(TimeService.nextWeek);

    assert.equal(TimeService.getMinutesInBetween(nextWeek, today), 7 * 24 * 60);
  });

  it("should should add minutes when addMinuts is called", () => {
    const today = new Date(TimeService.today);
    const tomorrow = TimeService.addMinutes(24 * 60, today);

    assert.equal(TimeService.getMinutesInBetween(tomorrow, today), 24 * 60);
  });

  it("should should return true/false whether date is today or not correctly", () => {
    const today = TimeService.today;
    const tomorrow = TimeService.tomorrow;

    assert.ok(TimeService.isToday(today));
    assert.ok(!TimeService.isToday(tomorrow));
  });

  it("should should return true/false whether date is in the past or not correctly", () => {
    const yesterday = TimeService.toDateString(
      TimeService.addMinutes(-24 * 60, new Date(TimeService.today))
    );
    const today = TimeService.today;
    const tomorrow = TimeService.tomorrow;

    assert.ok(TimeService.isPast(yesterday));
    assert.ok(!TimeService.isPast(today));
    assert.ok(!TimeService.isPast(tomorrow));
  });

  it("should parse date correctly to date string", () => {
    assert.equal(
      TimeService.toDateString(new Date("2024-01-05, 12:34")),
      "2024-01-05"
    );

    assert.equal(
      TimeService.toDateString(new Date("2024-12-31, 12:34")),
      "2024-12-31"
    );
  });

  it("should return time from date", () => {
    assert.equal(TimeService.getTime(new Date("2024-01-05, 12:34")), "11:34"); // GMT
    assert.equal(TimeService.getTime(new Date("2024-01-05, 09:05")), "08:05"); // GMT
  });

  it("should sort by date", () => {
    assert.deepEqual(
      ["2024-01-31", "2024-01-01", "2024-01-15"].sort(TimeService.sortByDate),
      ["2024-01-01", "2024-01-15", "2024-01-31"]
    );
  });
});
