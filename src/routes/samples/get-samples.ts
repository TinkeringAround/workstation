import AXIOS from "axios";
import { load } from "cheerio";
import { LoggerService } from "../../services/logger.service";

const Logger = new LoggerService("Get-Samples");
const ATTRIBUTE = "data-mp3";

export const getSamples = async (search: string) => {
  const url = `https://freesound.org/search/?q=${search}&f=license%3A%22creative+commons+0%22+duration%3A%5B0+TO+20%5D&w=&tm=0&s=Automatic+by+relevance&advanced=1&g=&only_p=&cm=0&page=1#sound`;
  const audios: string[] = [];

  try {
    Logger.log("Connecting to Freesound with search ", search);
    const response = await AXIOS.get(url);
    const queryHtml = load(response.data);

    Logger.log("Collecting Sounds from Freesound");
    [...queryHtml(`[${ATTRIBUTE}]`)].forEach((e) =>
      audios.push(e.attribs[ATTRIBUTE])
    );
  } catch (error) {
    Logger.log(error);
  }

  Logger.log("Collected Sound Files\n", audios.join("\n"));
  return audios;
};
