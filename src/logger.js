module.exports = class Logger {
  constructor(script) {
    this.script = script.toUpperCase();
  }

  log(...messages) {
    console.log(`${[this.script]}  `, ...messages);
  }
};
