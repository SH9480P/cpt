import { commands, ExtensionContext, window, workspace } from 'vscode'
import { updateCodeChange, updateCodingDuration, saveTracking } from './lib/workspaceStateHandler'
import { HelloWorldPanel } from './panels/HelloWorldPanel'
import { Complete } from './interface/complete.interface'

export function activate(context: ExtensionContext) {
    console.log('Congratulations, your extension "cpt" is now active!')

    if (context.workspaceState.get('complete') === undefined) {
        context.workspaceState.update('complete', {})
    }

    let veTest = commands.registerCommand('cpt.veTest', () => {
        if (context.workspaceState.get('complete') === undefined) {
            context.workspaceState.update('complete', {})
        }

        workspace.onDidChangeTextDocument((event) => {
            if (!event.document.isUntitled && event.document.languageId !== 'log') {
                let addNum = 0
                let deleteNum = 0

                for (let i of event.contentChanges) {
                    addNum += i.text.length
                    deleteNum += i.rangeLength
                    // console.log(i.text, i.text.length)
                }

                updateCodeChange(context, addNum, deleteNum)
                // console.log(context.workspaceState.get('codeChange'))
            }
        })

        window.onDidChangeTextEditorSelection((event) => {
            updateCodingDuration(context)
            // console.log(context.workspaceState.get('codingDuration'))
        })

        setInterval(
            () => {
                saveTracking(context)
                console.log(context.workspaceState.get('complete'))
            },
            1000 * 60 * 2
        )
    })

    let resetState = commands.registerCommand('cpt.resetState', () => {
        context.workspaceState.keys().forEach((key) => {
            context.workspaceState.update(key, undefined)
        })
        console.log('workspaceState was reset!')
    })

    context.subscriptions.push(veTest)
    context.subscriptions.push(resetState)
    const showHelloWorldCommand = commands.registerCommand('cpt.showHelloWorld', () => {
        HelloWorldPanel.render(context.extensionUri, context)
        console.log('panel open!')
    })

    // Add command to the extension context
    context.subscriptions.push(showHelloWorldCommand)
}

export function deactivate() {}
