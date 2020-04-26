export function isEmpty(o: any) {
    if (!o) {
        return true;
    }

    if (o.length && o.length === 0) {
        return true;
    }

    if (Object.keys(o).length === 0) {
        return true;
    }
}
