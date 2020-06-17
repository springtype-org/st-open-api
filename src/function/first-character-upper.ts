export const firstCharacterUpper = (str: string) => {
    if (!!str) {
        return str.substr(0, 1).toUpperCase() + str.substr(1);
    }
    return str;
}