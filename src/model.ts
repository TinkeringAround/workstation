import { calendar_v3 } from "googleapis";

export interface Downloadable {
  name: string;
  url: string;
}

export interface FreesoundAudio {
  id: string;
  name: string;
  url: string;
}

export type ReminderPriority = "Hoch" | "Mittel" | "Gering" | "";

export interface AppleReminder {
  date: string;
  tags: string;
  title: string;
  url: string;
  note: string;
  list: string;
  location: string;
  priority: ReminderPriority;
}

export type GoogleCalendarEvent = calendar_v3.Schema$Event;
