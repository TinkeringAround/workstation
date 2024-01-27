import { AppleReminder } from "../../model";
import { TimeService } from "../../services/time.service";
import CalendarEvent from "./calendar-event";

export default class Reminder {
  private reminder: AppleReminder;
  private dateAndTime: string[]; // ["2024-01-21", "10:00"]
  private slot: CalendarEvent | null = null;

  constructor(reminder: AppleReminder) {
    this.reminder = reminder;
    this.dateAndTime = Reminder.normalizeDate(reminder.date);
  }

  get event() {
    return {
      summary: this.reminder.title.trim(),
      location: this.reminder.location,
      description: [this.reminder.note, this.reminder.url].join("\n").trim(),
      start: {
        dateTime: this.start,
        timeZone: "Europe/Berlin",
      },
      end: {
        dateTime: this.end,
        timeZone: "Europe/Berlin",
      },
      reminders: {
        useDefault: false,
        overrides: [],
      },
    };
  }

  get title() {
    return this.reminder.title;
  }

  get date() {
    return this.dateAndTime[0];
  }

  get time() {
    return this.dateAndTime[1];
  }

  get start() {
    const date = TimeService.isPast(this.date) ? TimeService.today : this.date;
    const startDate = this.isTimed ? date : this.slot?.date;
    const startInSlot = this.isTimed ? this.time : this.slot?.getStartOf(this);

    if (startDate && startInSlot) {
      return `${startDate}T${startInSlot}:00+01:00`;
    }

    throw new Error("Could not calculate start time for reminder without slot");
  }

  get end() {
    const date = TimeService.isPast(this.date) ? TimeService.today : this.date;
    const startDate = this.isTimed ? date : this.slot?.date;
    const startInSlot = this.isTimed ? this.time : this.slot?.getStartOf(this);

    if (startDate && startInSlot) {
      const endDate = TimeService.addMinutes(
        this.minutes + 60, // + 60 Min for Berlin Timezone
        new Date(`${startDate}, ${startInSlot}`)
      );

      return `${startDate}T${TimeService.getTime(endDate)}:00+01:00`;
    }

    throw new Error("Could not calculate end time for reminder without slot");
  }

  get minutes(): number {
    return Math.max(
      ...this.reminder.tags.split("\n").map((tag) => this.tagToMinute(tag))
    );
  }

  get priority(): number {
    switch (this.reminder.priority) {
      case "Hoch":
        return 0;
      case "Mittel":
        return 1;
      case "Gering":
        return 2;
      default:
        return 3;
    }
  }

  get isPlanned() {
    return !!this.slot;
  }

  get isTimed() {
    return this.time !== "00:00";
  }

  get [Symbol.toStringTag]() {
    return this.reminder.title;
  }

  assignTo(slot: CalendarEvent) {
    this.slot = slot;
  }

  private tagToMinute(tag: string): number {
    if (tag.includes("h")) {
      return Number(tag.split("h").shift()) * 60;
    } else if (tag.includes("min")) {
      return Number(tag.split("min").shift());
    }

    return 0;
  }

  private static normalizeDate(date: string) {
    const [dateOnly, timeOnly] = date.split(", ");

    if (dateOnly && timeOnly) {
      const [day, month, year] = dateOnly.split(".");
      return [`${year}-${month}-${day}`, timeOnly.trim()];
    }

    throw new Error(`Date Format could not normalized from ${date}`);
  }
}
