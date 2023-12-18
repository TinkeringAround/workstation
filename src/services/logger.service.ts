export class LoggerService {
  readonly script: string;

  constructor(script: string) {
    this.script = script.toUpperCase();
  }

  static init(script: string) {
    return new LoggerService(script);
  }

  log(...messages: any[]) {
    console.log(`${[this.script]}  `, ...messages);
  }
}
