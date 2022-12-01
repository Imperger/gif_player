export function Never(msg: string = "Can't be null or undefined"): never {
    throw new Error(msg);
}
