<script setup lang="ts">

</script>

<template>
    <button v-bind="$attrs">
        <slot></slot>
        <span class="tooltip">
            <slot name="tooltip"></slot>
        </span>
    </button>
</template>

<style scoped>
button {
    position: relative;
    outline: none;
}

button .tooltip {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 50px;
    visibility: hidden;
    text-align: center;
}

button:hover .tooltip {
    visibility: visible;
}
</style>