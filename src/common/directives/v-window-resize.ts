import { App, DirectiveBinding, VNode } from "vue";

const listeners = new Set<() => any>();

const directive = {
    mounted: (el: HTMLElement, binding: DirectiveBinding, node: VNode, prevNod: VNode | null) => {
        if (listeners.size === 0) {
            window.addEventListener('resize', ResizeHandler);
        }

        listeners.add(binding.value);
    },
    unmounted: (el: HTMLElement, binding: DirectiveBinding, node: VNode, prevNod: VNode | null) => {
        listeners.delete(binding.value);

        if (listeners.size === 0) {
            window.removeEventListener('resize', ResizeHandler);
        }
    }
};

function ResizeHandler() {
    listeners.forEach(listener => listener());
}

export default (app: App<Element>) => app.directive('window-resize', directive);
