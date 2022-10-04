<script setup lang="ts">
import { ref } from 'vue';
import { ParsedFrame } from 'gifuct-js';

import Player from './player/Player.vue';
import Loader from './loader/Loader.vue';

const frames = ref<ParsedFrame[]>([]);

function FramesLoaded(f: ParsedFrame[]) {
  frames.value = f;
}

</script>

<template>
  <Loader @loaded="FramesLoaded" class="player">
    <Player :frames="frames" />
  </Loader>
</template>

<style scoped>
.player {
  width: auto;
  height: 100vh;
}
</style>
