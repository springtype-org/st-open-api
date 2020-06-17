export const firstCharacterLower = (str: string) => {
    if (!!str) {
        return str.substr(0, 1).toLowerCase() + str.substr(1);
    }
    return str;
}