import { calendar_v3 } from "googleapis";
import Reminder from "./reminder";
import { TimeService } from "../../services/time.service";

export default class CalendarEvent {
  private event: calendar_v3.Schema$Event;
  private reminders: Reminder[] = [];

  constructor(event: calendar_v3.Schema$Event) {
    if (!event.start?.dateTime || !event.end?.dateTime) {
      throw new Error("Start and End must be valid dates");
    }

    this.event = event;
  }

  get title() {
    return this.event.summary;
  }

  get id() {
    return this.event.id;
  }

  get date() {
    const berlinDate = new Date(Date.parse(this.event.start?.dateTime ?? ""));
    return TimeService.toDateString(berlinDate);
  }

  get start() {
    return TimeService.addMinutes(
      60,
      new Date(this.event.start?.dateTime ?? "")
    );
  }

  get end() {
    return TimeService.addMinutes(60, new Date(this.event.end?.dateTime ?? ""));
  }

  get minutes() {
    return TimeService.getMinutesInBetween(this.end, this.start);
  }

  get minutesPlanned() {
    return this.reminders.reduce((sum, reminder) => sum + reminder.minutes, 0);
  }

  get minutesLeft() {
    return this.minutes - this.minutesPlanned;
  }

  get [Symbol.toStringTag]() {
    return ["SLOT", this.reminders.map((task) => task.toString()).join(" ")];
  }

  get assignedReminders() {
    return this.reminders;
  }

  get breakTime() {
    const minutesUnplanned = this.minutes - this.minutesPlanned;
    return Math.min(
      minutesUnplanned -
        (minutesUnplanned % this.reminders.length) / this.reminders.length,
      5
    );
  }

  addReminder(...reminders: Reminder[]) {
    this.reminders.push(...reminders);
  }

  getStartOf(reminder: Reminder) {
    const breakTime = this.breakTime;
    let offsetMinutes = 0;

    for (let i = 0; i <= this.reminders.length; i++) {
      const { title, minutes } = this.reminders[i];
      if (title === reminder.title) {
        break;
      }

      offsetMinutes += minutes + breakTime;
    }

    const hours =
      TimeService.addMinutes(offsetMinutes, this.start).getHours() - 1; // Berlin Timezone = +1
    const normalizedHours = hours < 10 ? `0${hours}` : hours;
    const minutes = TimeService.addMinutes(
      offsetMinutes,
      this.start
    ).getMinutes();
    const normalizedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${normalizedHours}:${normalizedMinutes}`;
  }

  isSlot() {
    return this.event.summary?.trim().toLowerCase() === "slot";
  }
}
