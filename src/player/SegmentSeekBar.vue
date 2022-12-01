<script setup lang="ts">
import { computed, ref } from 'vue';
import { SegmentsSquasher } from './segments-squasher';

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

const segments = computed(() => {
    return [
        ...props.segments.map((p, i, s) => ({ width: (p - s[i - 1]) / props.duration * 100, pts: s[i - 1] })).slice(1),
        { width: (props.duration - props.segments[props.segments.length - 1]) / props.duration * 100, pts: props.segments[props.segments.length - 1] }]
        .flatMap(SegmentsSquasher(1));
});

function Rel(value: number): string {
    return value + '%';
}

function EndPTS(idx: number): number {
    return segments.value[idx + 1]?.pts ?? props.duration;
}

function SegmentProgress(idx: number): number {
    const begin = segments.value[idx].pts;
    const end = EndPTS(idx);

    if (props.playTime > end) {
        return 100;
    } else if (props.playTime < begin) {
        return 0;
    } else {
        return (props.playTime - begin) / (end - begin) * 100;
    }
}

function SegmentKey(idx: number, width: number) {
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
        <div v-for="(s, idx) in segments" :key="SegmentKey(idx, s.width)" :style="{ width: Rel(s.width) }"
            class="segment">
            <div class="segment-progress" :class="{ 'segment-squashed': s.squashed }"
                :style="{ width: Rel(SegmentProgress(idx)) }"></div>
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

.segment-squashed {
    background-color: #c51162;
}
</style>