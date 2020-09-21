export const sorted = (array: Array<any>) => {
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

export const sortedBy = (array: Array<any>, fieldName: string) => {
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