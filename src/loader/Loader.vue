<script setup lang="ts">
import { ParsedFrame } from 'gifuct-js';

import { DecodeFrames } from './loader';

interface Emits {
    (e: 'loaded', frames: ParsedFrame[]): void
}

const emit = defineEmits<Emits>();

async function Decode(image: Blob | null) {
    if (image === null) {
        return;
    }

    const frames = DecodeFrames(await image.arrayBuffer());

    if (frames.length > 0) {
        emit('loaded', frames);
    } else {
        console.log('No frames found');
    }

}

</script>
    
<template>
    <div @drop.native.stop.prevent="Decode($event.dataTransfer?.files[0] ?? null)" @dragover.native.stop.prevent="_=>_"
        class="drop-zone">
        <slot></slot>
    </div>
</template>

<style scoped>
.drop-zone {
}
</style>