import AXIOS from "axios";
import { load } from "cheerio";
import { LoggerService } from "../../../services/logger.service";
import { FreesoundAudio } from "../../../model";

const LOGGER = new LoggerService("Get-Samples");
const ID_ATTRIBUTE = "data-sound-id";
const TITLE_ATTRIBUTE = "data-title";
const MP3_ATTRIBUTE = "data-mp3";

export const getSamples = async (search: string) => {
  const url = `https://freesound.org/search/?q=${search}&f=license%3A%22creative+commons+0%22+duration%3A%5B0+TO+20%5D&w=&tm=0&s=Automatic+by+relevance&advanced=1&g=&only_p=&cm=0&page=1#sound`;
  const audios: FreesoundAudio[] = [];

  try {
    LOGGER.log("Connecting to Freesound with search ", search);
    const response = await AXIOS.get(url);
    const queryHtml = load(response.data);

    LOGGER.log("Collecting Sounds from Freesound");
    [...queryHtml(`[${MP3_ATTRIBUTE}]`)].forEach((e) =>
      audios.push({
        id: e.attribs[ID_ATTRIBUTE],
        name: e.attribs[TITLE_ATTRIBUTE],
        url: e.attribs[MP3_ATTRIBUTE],
      })
    );
  } catch (error) {
    LOGGER.log(error);
  }

  LOGGER.log("Collected Sound Files counting ", audios.length);
  return audios;
};
