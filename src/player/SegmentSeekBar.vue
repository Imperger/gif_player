<script setup lang="ts">
import { computed, ref } from 'vue';

const props = defineProps({
    playTime: { required: true, type: Number },
    duration: { required: true, type: Number },
    segments: { required: true, type: Array<number> }
});

interface Emits {
    (e: 'seek', playTime: number): void
}

const emit = defineEmits<Emits>();

const wrapper = ref<HTMLElement>();

const segmentsRelativeWidth = computed(() => [
    ...props.segments.map((w, i, s) => (w - s[i - 1]) / props.duration * 100).slice(1),
    (props.duration - props.segments[props.segments.length - 1]) / props.duration * 100]);

function Rel(value: number): string {
    return value + '%';
}

function EndPTS(idx: number): number {
    return props.segments[idx + 1] ?? props.duration;
}

function SegmentProgress(idx: number): number {
    const start = props.segments[idx];
    const end = EndPTS(idx);

    if (props.playTime > end) {
        return 100;
    } else if (props.playTime < start) {
        return 0;
    } else {
        return (props.playTime - props.segments[idx]) / (end - props.segments[idx]) * 100;
    }
}

function segmentKey(idx: number, width: number) {
    return `${idx}_${width}`;
}

function Seek(e: MouseEvent, ref?: HTMLElement) {
    if (ref === undefined) {
        return;
    }

    const rect = ref.getBoundingClientRect();

    emit('seek', (e.clientX - rect.left) / rect.width * props.duration);
}

</script>

<template>
    <div ref="wrapper" @click="Seek($event, wrapper)" class="segments-wrapper">
        <div v-for="(width, idx) in segmentsRelativeWidth" :key="segmentKey(idx, width)" :style="{ width: Rel(width) }"
            class="segment">
            <div class="segment-progress" :style="{ width: Rel(SegmentProgress(idx)) }"></div>
        </div>
    </div>
</template>

<style scoped>
.segments-wrapper {
    display: flex;
    flex-direction: row;
    min-height: 10px;
    margin-top: 5px;
}

.segments-wrapper:hover {
    height: 15px;
    min-height: 15px;
    margin-top: 0;
}

.segment {
    box-sizing: border-box;
    align-self: flex-end;
    height: 70%;
    border-right: 2px solid #ffffffff;
    background-color: #9e9e9e;
}

.segment:last-of-type {
    border-right: 0;
}

.segment:hover {
    height: 100%;
}

.segment-progress {
    height: 100%;
    background-color: #ff0000;
}
</style>