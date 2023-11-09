const AXIOS = require("axios");
const CHEERIO = require("cheerio");
const CP = require("child_process");
const LOGGER = require("./logger");

// Variables
const Logger = new LOGGER("Get-Samples");
const SEARCH = process.argv[2]; // the search query
const ATTRIBUTE = "data-mp3";

// Functions
const downloadMp3 = async function (url, fileName) {
  CP.execSync(`curl -o ${fileName}  '${url}'`);
  return fileName;
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
      const mp3File = downloadMp3(mp3Url, `${index}-${SEARCH}.mp3`);

      if (mp3File) {
        mp3Files.push(mp3File);
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

  const mp3Files = await getSounds(
    `https://freesound.org/search/?q=${SEARCH}&f=license%3A%22creative+commons+0%22+duration%3A%5B0+TO+20%5D&w=&tm=0&s=Automatic+by+relevance&advanced=1&g=&only_p=&cm=0&page=1#sound`
  );

  // TODO: Upload to Drive

  Logger.log("--- End ---");
})();
