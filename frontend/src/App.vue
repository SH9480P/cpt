<template>
    <main>
        <vscode-button @click="handleHowdyClick" style="display: none">Howdy!</vscode-button>
        <Container :complete="complete"></Container>
    </main>
</template>

<script lang="ts">
import { provideVSCodeDesignSystem, vsCodeButton } from '@vscode/webview-ui-toolkit'
import { vscode } from './utilities/vscode'
import { defineComponent } from 'vue'
import Container from './components/Container.vue'

provideVSCodeDesignSystem().register(vsCodeButton())

export default defineComponent({
    name: 'App',
    data() {
        return {
            complete: {},
        }
    },
    methods: {
        handleHowdyClick() {
            vscode.postMessage({
                command: 'hello',
                text: 'Hey there partner! 🤠',
            })
        },
    },
    computed: {},
    components: {
        Container,
    },
    mounted() {
        window.addEventListener('message', (event) => {
            const message = event.data

            switch (message.command) {
                case 'getWorkspaceState':
                    this.complete = message.content
                    break
                case 'start':
                    this.complete = message.content
                    break
            }
        })

        vscode.postMessage({
            command: 'start',
        })
    },
    beforeDestroy() {
        window.removeEventListener('message', (event) => {
            const message = event.data

            switch (message.command) {
                case 'getWorkspaceState':
                    this.complete = message.content
                    break
                case 'start':
                    this.complete = message.content
                    break
            }
        })
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
    color: #eeeeee;
    letter-spacing: 0.07em;
}
body {
    background-color: #313131;
}

h3 {
    font-weight: 600;
}

.dp__theme_dark {
    --dp-background-color: #525252;
    --dp-text-color: #eee;
}
</style>
