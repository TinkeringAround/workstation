export class TimeService {
  static get today() {
    return TimeService.toDateString(new Date());
  }

  static get tomorrow() {
    const tomorrow = new Date();
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    return TimeService.toDateString(tomorrow);
  }

  static get nextWeek() {
    const nextWeek = new Date();
    nextWeek.setUTCDate(nextWeek.getUTCDate() + 7);
    return TimeService.toDateString(nextWeek);
  }

  static addMinutes(minutes: number, date: Date) {
    const newDate = new Date(date.getTime());
    newDate.setTime(date.getTime() + minutes * 60 * 1000);
    return newDate;
  }

  static getMinutesInBetween(date1: Date, date2: Date): number {
    return (new Date(date1).getTime() - new Date(date2).getTime()) / 60 / 1000;
  }

  static isToday(date: string) {
    return TimeService.today === date;
  }

  static isPast(date: string) {
    return TimeService.today.localeCompare(date) > 0;
  }

  static isDate(date1: string, date2: string) {
    return date1 === date2;
  }

  static toDateString(date: Date) {
    const day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
    const month =
      date.getMonth() + 1 < 10
        ? `0${date.getMonth() + 1}`
        : date.getMonth() + 1;
    return [date.getFullYear(), month, day].join("-");
  }

  static toTimeString(date: string) {
    return new Date(date).toISOString();
  }

  static getTime(date: Date) {
    const hours = date.getHours() - 1; // Berlin Timezone = +1
    const normalizedHours = hours < 10 ? `0${hours}` : hours;
    const minutes = date.getMinutes();
    const normalizedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${normalizedHours}:${normalizedMinutes}`;
  }

  static sortByDate(date1: string, date2: string) {
    return date1.localeCompare(date2);
  }
}
