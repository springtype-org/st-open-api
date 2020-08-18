export const kebabCaseToSnake = (kebab: string) => {
    return kebab.split('-')
        .filter(v => !!v)
        .join('_');
}
