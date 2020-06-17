export const kebabCaseToCamel = (kebab: string) => {
    return kebab.split('-')
        .filter(v => !!v)
        .map(v => v.substr(0, 1).toUpperCase() + v.substr(1))
        .join('');
}