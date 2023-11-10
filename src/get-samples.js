const AXIOS = require("axios");
const CHEERIO = require("cheerio");
const CP = require("child_process");

// Modules
const LOGGER = require("./logger");
const GoogleDriveService = require("./services/google-drive.service");

// Variables
const Logger = new LOGGER("Get-Samples");
const SEARCH = process.argv[2]; // the search query
const ATTRIBUTE = "data-mp3";

// Functions
const downloadMp3 = async function (url, fileName) {
  CP.execSync(`curl -o ${fileName}  '${url}'`);
};

const getSounds = async (url) => {
  const mp3Files = [];

  try {
    const response = await AXIOS.get(url);
    const queryHtml = CHEERIO.load(response.data);

    const urls = [...queryHtml(`[${ATTRIBUTE}]`)].map(
      (e) => e.attribs[ATTRIBUTE]
    );
    Logger.log(url, " : ", urls);

    for (let [index, mp3Url] of urls.entries()) {
      const name = `${index}-${SEARCH}.mp3`;
      const fileName = downloadMp3(mp3Url, name);

      if (fileName) {
        mp3Files.push(name);
      }
    }

    return mp3Files;
  } catch (error) {
    console.error(error);
    return mp3Files;
  }
};

// Main
(async () => {
  Logger.log("--- Start ---");

  const driveService = new GoogleDriveService();

  // Collect Sounds
  const mp3Files = await getSounds(
    `https://freesound.org/search/?q=${SEARCH}&f=license%3A%22creative+commons+0%22+duration%3A%5B0+TO+20%5D&w=&tm=0&s=Automatic+by+relevance&advanced=1&g=&only_p=&cm=0&page=1#sound`
  );

  // Upload to Drive
  for (let name of mp3Files) {
    const response = await driveService.uploadFile(name, "audio/mpeg");
    Logger.log("Uploaded:  ", name, " ", response.data);
  }

  Logger.log("--- End ---");
})();
