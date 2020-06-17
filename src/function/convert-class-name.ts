import {firstCharacterUpper} from "./first-character-upper";
import {kebabCaseToCamel} from "./kebab-case-to-camel";

export const convertClassName = (name: string) => {
    return kebabCaseToCamel(firstCharacterUpper(name).replace('_','-'));
}