import { GoogleCalendarEvent, AppleReminder } from "../../model";
import { LoggerService } from "../../services/logger.service";
import { GoogleCalendarService } from "../../services/google-calendar.service";
import { TimeService } from "../../services/time.service";
import { ConfigService } from "../../services/config.service";
import CalendarEvent from "./calendar-event";
import Reminder from "./reminder";

const googleCalendarService = new GoogleCalendarService();
const LOGGER = new LoggerService("planner.ts");

export class Planner {
  static readonly MAX_MINUTES = 120;

  dates: string[];
  groupedReminders: { [key: string]: Reminder[] } = {
    past: [], // reminders are leftover from past days
    timed: [], // reminders which are timed and should not be planned into slots but fixed
  };

  constructor(appleReminders: AppleReminder[]) {
    const dates = new Set<string>();

    appleReminders
      .map((appleReminder) => new Reminder(appleReminder))
      .forEach((reminder) => {
        if (reminder.isTimed) {
          this.groupedReminders["timed"].push(reminder);
          return;
        }

        if (TimeService.isPast(reminder.date)) {
          this.groupedReminders["past"].push(reminder);
          return;
        }

        dates.add(reminder.date);
        if (this.groupedReminders[reminder.date]) {
          this.groupedReminders[reminder.date].push(reminder);
        } else {
          this.groupedReminders[reminder.date] = [reminder];
        }
      });

    this.dates = [...dates].sort(TimeService.sortByDate);
  }

  get latestDate() {
    return [...this.dates].pop() ?? TimeService.today;
  }

  async planTasks(): Promise<boolean> {
    await this.clearTasks(TimeService.toTimeString(this.latestDate));
    const slots = await this.getSlots();

    this.dates.forEach((date) => {
      LOGGER.log(`Searching for reminders and time slots for date ${date}...`);
      const remindersForDate = this.getRemindersForDate(date);
      const slotsForDate = this.getSlotsForDate(slots, date);

      if (slotsForDate.length > 0 && remindersForDate.length > 0) {
        LOGGER.log(
          `Trying to planout ${remindersForDate.length} reminders to ${slotsForDate.length} time slots for date ${date}...`
        );

        // Planout Slots
        slotsForDate.forEach(async (slot) => {
          this.arrangeRemindersTo(slot, remindersForDate);
          await Promise.all([
            ...slot.assignedReminders.map((reminder) =>
              googleCalendarService.createEvent(reminder.event)
            ),
          ]);
        });
      }
    });

    // Planout Timed Reminders
    LOGGER.log(
      `Creating ${this.groupedReminders["timed"].length} timed reminders...`
    );
    await Promise.all([
      ...this.groupedReminders["timed"].map((reminder) =>
        googleCalendarService.createEvent(reminder.event)
      ),
    ]);

    return true;
  }

  async clearTasks(timeMax = TimeService.toTimeString(TimeService.nextWeek)) {
    LOGGER.log(`Cleaning up planned tasks until the ${timeMax}...`);
    const events =
      (await googleCalendarService.listEventsIn({
        calendarId: ConfigService.get("GOOGLE_DRIVE_CALENDAR_ID_TASKS"),
        timeMax,
      })) ?? ([] as GoogleCalendarEvent[]);

    return Promise.all([
      ...events
        .map((event) => new CalendarEvent(event))
        .map(
          (calendarEvent) =>
            calendarEvent.id &&
            googleCalendarService.deleteEvent(calendarEvent.id)
        ),
    ]);
  }

  private async getSlots(): Promise<CalendarEvent[]> {
    const events = (await googleCalendarService.listEventsIn()) ?? [];

    return events
      .map((event) => new CalendarEvent(event))
      .filter((calendarEvent) => calendarEvent.isSlot());
  }

  private getRemindersForDate(date: string) {
    if (TimeService.isToday(date)) {
      // on day consider past reminders as well
      return [...this.groupedReminders["past"], ...this.groupedReminders[date]];
    }

    return this.groupedReminders[date];
  }

  private getSlotsForDate(slots: CalendarEvent[], date: string) {
    return slots
      .filter((calendarEvent) =>
        TimeService.isDate(TimeService.toDateString(calendarEvent.start), date)
      )
      .sort((calendarEvent) => calendarEvent.start.getTime());
  }

  private arrangeRemindersTo(slot: CalendarEvent, reminders: Reminder[]) {
    const possibleReminders = reminders
      .filter((reminder) => !reminder.isPlanned)
      .filter(
        (reminder) =>
          slot.minutesLeft >= reminder.minutes ||
          reminder.minutes > Planner.MAX_MINUTES
      )
      .sort((a, b) => a.priority - b.priority)
      .sort((a, b) => a.time.localeCompare(b.time));

    if (possibleReminders.length > 0) {
      while (slot.minutesLeft > 0 && possibleReminders.length > 0) {
        const reminder = possibleReminders.shift();

        if (reminder && slot.minutesLeft >= reminder.minutes) {
          slot.addReminder(reminder);
          reminder.assignTo(slot);
        }
      }
    }
  }
}
