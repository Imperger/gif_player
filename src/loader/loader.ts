import { parseGIF, decompressFrames } from 'gifuct-js';

export function DecodeFrames(image: ArrayBuffer) {
    return decompressFrames(parseGIF(image), true);
}