<template>
    <main>
        <h1>Hello world!</h1>
        <vscode-button @click="handleHowdyClick">Howdy!</vscode-button>
    </main>
</template>

<script lang="ts">
import { provideVSCodeDesignSystem, vsCodeButton } from '@vscode/webview-ui-toolkit'
import { vscode } from './utilities/vscode'
import { defineComponent } from 'vue'

provideVSCodeDesignSystem().register(vsCodeButton())

export default defineComponent({
    name: 'App',
    methods: {
        handleHowdyClick() {
            vscode.postMessage({
                command: 'hello',
                text: 'Hey there partner! 🤠',
            })
        },
    },
})
</script>

<style>
main {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    height: 100%;
}
</style>
