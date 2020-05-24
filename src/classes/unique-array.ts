export class UniqueArray<T>{
    internalArray: Array<T> = [];

    push(...str: T[]) {
        if (!Array.isArray(str)) {
            str = [str];
        }

        str.filter(t => !!t).forEach(t =>{

        if (this.internalArray.indexOf(t) === -1) {
            this.internalArray.push(t);
        }
        });
    }

    get(): Array<T> {
        return [...this.internalArray]
    }
}