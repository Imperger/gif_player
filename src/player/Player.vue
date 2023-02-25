<script setup lang="ts">
import { ref, onMounted, computed, watch, onUnmounted } from 'vue'
import { ParsedFrame } from 'gifuct-js';
import PlayIcon from 'vue-material-design-icons/Play.vue';
import PauseIcon from 'vue-material-design-icons/Pause.vue';
import SkipNextIcon from 'vue-material-design-icons/SkipNext.vue';
import SkipPrevIcon from 'vue-material-design-icons/SkipPrevious.vue';

import { MsToMmss } from './ms-to-mm-ss';
import { FrameBuilder } from './frame-builder';
import SegmentSeekBar from './SegmentSeekBar.vue';
import MyButton from '../ui/MyButton.vue';

const props = defineProps({
    frames: { required: true, type: Array<ParsedFrame> }
});

const component = ref<HTMLDivElement>();
const canvas = ref<HTMLCanvasElement>();
const playTime = ref(0);
const isPlaying = ref(false);
const nextFrameIdx = ref(0);
const componentWidthInner = ref(0);

let frameBuilder: FrameBuilder | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let innerPlayTime = 0;

watch(() => props.frames, (frames, prev) => onFramesLoaded(frames));

function onFramesLoaded(frames: ParsedFrame[]) {
    const { width, height } = frames[0].dims;

    frameBuilder = new FrameBuilder(frames);
    canvas.value!.width = width;
    canvas.value!.height = height;

    ResetPlayback();
    RenderFrame();
}

onMounted(() => ctx = canvas.value?.getContext('2d') ?? null);
onUnmounted(() => isPlaying.value = false);

function OnResize() {
    componentWidthInner.value = component.value?.clientWidth ?? 0;
}

onMounted(() => {
    OnResize();
});

function PlayPauseByShortcut(e: KeyboardEvent) {
    if ((e.target as HTMLElement).tagName?.toLowerCase() !== 'button') {
        PlayPause();
    }
}

function PlayPause() {
    if (isPlaying.value) {

    } else {
        if (AtEnd()) {
            ResetPlayback();
        }

        ScheduleRAF();
    }

    isPlaying.value = !isPlaying.value;
}

function ScheduleRAF() {
    const tm = performance.now();
    window.requestAnimationFrame(now => UpdateUI(now - tm));
}

function UpdateUI(delta: number) {
    innerPlayTime += delta;

    const syncInterval = 100;
    if (innerPlayTime - playTime.value > syncInterval) {
        playTime.value = innerPlayTime;
    }

    if (innerPlayTime > framesPTS.value[nextFrameIdx.value]) {
        RenderFrame();

        ++nextFrameIdx.value;
    }

    if (AtEnd()) {
        isPlaying.value = false;
        playTime.value = innerPlayTime;
        return;
    }

    if (isPlaying.value) {
        ScheduleRAF();
    }
}

function ResetPlayback() {
    nextFrameIdx.value = 0;
    innerPlayTime = 0;
    playTime.value = 0;
}

function AtEnd(): boolean {
    return innerPlayTime > duration.value;
}

function Seek(pt: number) {
    innerPlayTime = pt;
    playTime.value = pt;

    let l = 0;
    for (let r = framesPTS.value.length; l < r;) {
        const mid = ((r - l) >> 1) + l;

        if (pt < framesPTS.value[mid]) {
            r = mid;
        } else {
            l = mid + 1;
        }
    }

    nextFrameIdx.value = l - 1;
    RenderFrame();
}

function RenderFrame() {
    ctx?.putImageData(frameBuilder!.Get(nextFrameIdx.value), 0, 0);
}

function NextFrame() {
    if (isNextDisabled.value) {
        return;
    }

    ++nextFrameIdx.value;
    innerPlayTime = framesPTS.value[nextFrameIdx.value];
    playTime.value = innerPlayTime;
    RenderFrame();
}

function PrevFrame() {
    if (isPrevDisabled.value) {
        return;
    }

    --nextFrameIdx.value;
    innerPlayTime = framesPTS.value[nextFrameIdx.value];
    playTime.value = innerPlayTime;
    RenderFrame();
}

function NumberToPx(val: number): string {
    return `${val}px`;
}

const hasFrames = computed(() => props.frames.length > 0);
const duration = computed(() => props.frames.reduce((duration, frame) => duration + frame.delay, 0));
const durationUI = computed(() => MsToMmss(duration.value));
const playTimeUI = computed(() => MsToMmss(playTime.value));
const framesPTS = computed(() => props.frames.reduce((pts, frame) => [...pts, pts[pts.length - 1] + frame.delay], [0]).slice(0, props.frames.length));
const isPrevDisabled = computed(() => !(hasFrames && nextFrameIdx.value > 0));
const isNextDisabled = computed(() => !(hasFrames && nextFrameIdx.value < framesPTS.value.length - 1));
const componentWidth = computed(() => componentWidthInner.value);

</script>

<template>
    <div v-window-resize="OnResize" ref="component" @keydown.left="PrevFrame" @keydown.right="NextFrame" @keydown.space="PlayPauseByShortcut" tabindex="0"
        class="player-component">
        <canvas ref="canvas" :style="{ width: NumberToPx(componentWidth) }" class="view"></canvas>
        <SegmentSeekBar :playTime="playTime" :duration="duration" :segments="framesPTS" @seek="Seek" class="seek-bar" />
        <div class="seek-panel">
            <div class="time">{{ playTimeUI }}</div>
            <div class="time">{{ durationUI }}</div>
        </div>
        <div class="controls">
            <MyButton @click="PlayPause" :disabled="!hasFrames" class="control-button">
                <PauseIcon v-if="isPlaying" />
                <PlayIcon v-else />
            </MyButton>
            <MyButton @click="PrevFrame" :disabled="isPrevDisabled" class="control-button">
                <SkipPrevIcon />
            </MyButton>
            <MyButton @click="NextFrame" :disabled="isNextDisabled" class="control-button">
                <SkipNextIcon />
            </MyButton>
        </div>
    </div>
</template>

<style scoped>
.player-component {
    display: flex;
    flex-direction: column;
    height: 100%;
    align-items: center;
    outline: none;
}

.view {
    min-height: 0;
    object-fit: contain;
    flex: 1 1 auto;
}

.seek-bar {
    width: 100%;
    flex: 0 1 auto;
}

.seek-panel {
    display: flex;
    flex-direction: row;
    width: 100%;
    justify-content: space-between;
    flex: 0 1 auto;
}

.time {
    margin: 0 5px;
}

.controls {
    flex: 0 1 auto;
    align-self: flex-start;
}

.control-button {
    margin: 0 10px;
}

.tooltip {
    color: black;
}
</style>
