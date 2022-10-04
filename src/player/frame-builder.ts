import type { ParsedFrame } from 'gifuct-js';
import { Never } from '../corner-case/never-nullish';

export class FrameBuilder {
    private static readonly DisposeAll = 2;
    private patchCanvas = document.createElement('canvas');
    private patchCtx = this.patchCanvas.getContext('2d');
    private gifCanvas = document.createElement('canvas');
    private gifCtx: CanvasRenderingContext2D;
    private patchImgData: ImageData | null = null;
    private framesCache: ImageData[];

    constructor(private frames: ParsedFrame[]) {
        if (frames.length === 0) {
            throw new Error('Empty animation');
        }

        this.gifCanvas.width = frames[0].dims.width;
        this.gifCanvas.height = frames[0].dims.height;
        this.gifCtx = this.gifCanvas.getContext('2d') ?? Never('Failed to get the gif 2d context');
        this.framesCache = Array.from({ length: frames.length });

        this.PrerenderFrames();
    }

    private PrerenderFrames(): void {
        for (let frameIdx = 0; frameIdx < this.frames.length; ++frameIdx) {
            const frame = this.frames[frameIdx];

            if (this.IsPatchImgDataIncompatible(frame)) {
                this.RegeneratePatchStructs(frame.dims.width, frame.dims.height);
            }

            this.patchImgData!.data.set(frame.patch);

            if (frame.disposalType == FrameBuilder.DisposeAll) {
                this.gifCtx?.clearRect(0, 0, this.gifCanvas.width ?? 0, this.gifCanvas.height ?? 0);
            }

            this.patchCtx?.putImageData(this.patchImgData!, 0, 0);
            this.gifCtx?.drawImage(this.patchCanvas, frame.dims.left, frame.dims.top);

            this.framesCache[frameIdx] = this.gifCtx.getImageData(0, 0, this.gifCanvas.width, this.gifCanvas.height);
        }
    }

    Get(frameIdx: number): ImageData {
        return this.framesCache[frameIdx];
    }


    private IsPatchImgDataIncompatible(frame: ParsedFrame): boolean {
        return this.patchImgData === null ||
            this.patchImgData.width !== frame.dims.width ||
            this.patchImgData.height !== frame.dims.height;
    }

    private RegeneratePatchStructs(width: number, height: number): void {
        this.patchCanvas.width = width;
        this.patchCanvas.height = height;
        this.patchImgData = this.patchCtx?.createImageData(width, height) ?? Never('Failed to create image data');
    }
}
