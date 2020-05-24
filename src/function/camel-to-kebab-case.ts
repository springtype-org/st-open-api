export const camelToKebabCase = (camelCase: string) => {
    return camelCase.replace(/[\w]([A-Z])/g, (m) => {
        return m[0] + "-" + m[1];
    }).toLowerCase();
}