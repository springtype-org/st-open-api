export const sortBy = (array: Array<any>, fieldName: string) => {
    return array.sort((a, b) => {
        if (a[fieldName] < b[fieldName]) {
            return -1
        }
        if (a[fieldName] > b[fieldName]) {
            return 1
        }
        return 0
    })
}
