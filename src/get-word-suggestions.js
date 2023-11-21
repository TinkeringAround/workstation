const fs = require("fs");
const path = require("path");

// Modules
const LOGGER = require("./logger");
const GoogleDriveService = require("./services/google-drive.service");

// Variables
const Logger = new LOGGER("Get-Word-Suggestions");
const WORD = process.argv[2].toLocaleLowerCase(); // the word to look up
const LANGUAGES = ["german", "english", "french"];
const FILE = `${WORD}.txt`;
const FILENAME = path.join(process.cwd(), FILE);

// Main
(async () => {
  Logger.log("--- Start ---");

  const driveService = new GoogleDriveService();

  // Collect Words
  const hits = LANGUAGES.map((language) => {
    const dict = JSON.parse(
      fs.readFileSync(
        path.join(process.cwd(), "src", "assets", `${language}.json`)
      )
    );

    return {
      language,
      hits: dict.filter((word) => word.toLowerCase().includes(WORD)),
    };
  });

  fs.writeFileSync(FILENAME, "");
  hits
    .filter(({ hits }) => hits.length > 0)
    .forEach(({ hits, language }) => {
      fs.appendFileSync(FILENAME, `-- ${language.toUpperCase()} --\n`);

      hits.forEach((hit) => {
        fs.appendFileSync(FILENAME, `${hit}\n`);
      });

      fs.appendFileSync(FILENAME, `\n\n`);
    });

  await driveService.uploadFile(FILE);

  Logger.log("--- End ---");
})();
