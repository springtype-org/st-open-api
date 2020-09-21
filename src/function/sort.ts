export const sort = (array: Array<any>) => {
    return array.sort((a, b) => {
        if (a < b) {
            return -1
        }
        if (a > b) {
            return 1
        }
        return 0
    })
}
