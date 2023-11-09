const fetch = require("node-fetch");
const cheerio = require("cheerio");
const cp = require("child_process");

// Modules
const Logger = require("./logger");

// Variables
const LOGGER = new Logger("Get-Samples");
const SEARCH = process.argv.slice(2); // the search query
const ATTRIBUTE = "data-mp3";

console.log(process.env);

// Functions
const downloadMp3 = async function (url, fileName) {
  return cp.execSync(`curl -o ${fileName}  '${url}'`);
};

const getSounds = async (url) => {
  try {
    const response = await fetch(url);
    const body = await response.text();
    const queryHtml = cheerio.load(body);

    const urls = [...queryHtml(`[${ATTRIBUTE}]`)].map(
      (e) => e.attribs[ATTRIBUTE]
    );
    Logger.log(url, " : ", urls);

    // for (let [index, mp3Url] of urls.entries()) {
    //   downloadMp3(
    //     mp3Url,
    //     `/Users/thomasmaier/Documents/Repos/song-creation-pipeline/files/${index}-${SEARCH}.mp3`
    //   );
    // }

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

// Main
(async () => {
  LOGGER.log("--- Start ---");

  // TODO: MKDIR in Drive Inbox

  await getSounds(
    `https://freesound.org/search/?q=${SEARCH}&f=license%3A%22creative+commons+0%22+duration%3A%5B0+TO+20%5D&w=&tm=0&s=Automatic+by+relevance&advanced=1&g=&only_p=&cm=0&page=1#sound`
  );

  LOGGER.log("--- End ---");
})();
