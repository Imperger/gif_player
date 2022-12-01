export function SegmentsSquasher(threshold: number) {
    let widthAccumulator = { width: 0, pts: 0 };
    return (value: { width: number, pts: number }, index: number) => {
        if (widthAccumulator.width === 0) {
            widthAccumulator.pts = value.pts;
        }

        widthAccumulator.width += value.width;

        if (widthAccumulator.width >= threshold) {
            const width = widthAccumulator.width;
            widthAccumulator.width = 0;
            return [{ width, pts: widthAccumulator.pts, squashed: width !== value.width }];
        } else {
            return [];
        }
    };
}
