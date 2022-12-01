export const NoEmit = Symbol('No emit');

export function SquashArray<T extends any[], TRet>(arr: T, fn: (value: T[0], index: number) => TRet | typeof NoEmit) {
    const ret: TRet[] = [];
    arr.forEach((x, n) => {
        const squashed = fn(x, n);

        if (squashed !== NoEmit) {
            ret.push(squashed);
        }
    });

    return ret;
}
