import { google } from "googleapis";
import { LoggerService } from "./logger.service";
import { ConfigService } from "./config.service";
import { TimeService } from "./time.service";
import { GoogleCalendarEvent } from "../model";

const LOGGER = new LoggerService("Google-Drive-Service");

export class GoogleCalendarService {
  jwtClient;

  constructor() {
    this.jwtClient = new google.auth.JWT({
      email: ConfigService.get("GOOGLE_DRIVE_CLIENT_EMAIL") as string,
      key: atob(ConfigService.get("GOOGLE_DRIVE_PRIVATE_KEY") as string),
      scopes: ["https://www.googleapis.com/auth/calendar.events"],
    });
  }

  async getClient() {
    await this.jwtClient?.authorize();
    return this.jwtClient;
  }

  async getCalendarService(auth: any) {
    return google.calendar({ version: "v3", auth });
  }

  async listEventsIn(
    options: { timeMin?: string; timeMax?: string; calendarId?: string } = {}
  ): Promise<void | GoogleCalendarEvent[]> {
    const {
      timeMin = TimeService.toTimeString(TimeService.today),
      timeMax = TimeService.toTimeString(TimeService.nextWeek),
      calendarId = ConfigService.get("GOOGLE_DRIVE_CALENDAR_ID"),
    } = options;

    return this.getClient()
      .then(this.getCalendarService)
      .then(async (calendarService) =>
        calendarService.events.list({
          calendarId,
          timeMin,
          timeMax,
          maxResults: 100,
          singleEvents: true,
          orderBy: "startTime",
        })
      )
      .then((response) => response?.data?.items)
      .then((items) => {
        LOGGER.log(`-> ${items?.map((item) => item.summary).join(", ")}`);
        return (items ?? []) as GoogleCalendarEvent[];
      })
      .catch(this.handleError);
  }

  async createEvent(event: GoogleCalendarEvent) {
    return this.getClient()
      .then(this.getCalendarService)
      .then(async (calendarService) =>
        calendarService.events.insert({
          calendarId: ConfigService.get("GOOGLE_DRIVE_CALENDAR_ID_TASKS"),
          requestBody: event,
        })
      )
      .then((response) => response?.data.status)
      .then(this.logResult)
      .catch(this.handleError);
  }

  async deleteEvent(eventId: string) {
    LOGGER.log(`Deleting Calendar Event ${eventId}...`);
    return this.getClient()
      .then(this.getCalendarService)
      .then(async (calendarService) =>
        calendarService.events.delete({
          calendarId: ConfigService.get("GOOGLE_DRIVE_CALENDAR_ID_TASKS"),
          eventId,
        })
      )
      .then((response) => response?.status)
      .then(this.logResult)
      .catch(this.handleError);
  }

  logResult(result: any) {
    LOGGER.log(`-> ${result}`);
    return result;
  }

  handleError(error: any) {
    LOGGER.log(error);
  }
}
