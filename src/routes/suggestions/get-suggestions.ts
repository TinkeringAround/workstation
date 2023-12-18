import fs from "fs";
import path from "path";
import { LoggerService } from "../../services/logger.service";

const Logger = LoggerService.init("Suggestions");
const LANGUAGES = ["german", "english", "french"];

export const getSuggestions = (search: string) => {
  Logger.log("Collecting Hits...");
  const total: string[] = [];
  LANGUAGES.map((language) => {
    const dict = JSON.parse(
      fs.readFileSync(
        path.join(process.cwd(), "src", "assets", `${language}.json`)
      ) as any
    );

    return {
      language,
      hits: dict.filter((word: string) => word.toLowerCase().includes(search)),
    };
  })
    .filter(({ hits }) => hits.length > 0)
    .forEach(({ hits, language }) => {
      total.push(language.toUpperCase());
      total.push(...hits);
      total.push("");
    });

  Logger.log(total);
  return total;
};
