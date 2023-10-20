const vscode = require('vscode')
const { updateCodeChange, updateCodingDuration, saveTracking } = require('./lib/workspaceStateHandler')

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    console.log('Congratulations, your extension "cpt" is now active!')

    let veTest = vscode.commands.registerCommand('cpt.veTest', () => {
        if (context.workspaceState.get('complete') === undefined) {
            context.workspaceState.update('complete', {})
        }

        vscode.workspace.onDidChangeTextDocument((event) => {
            if (!event.document.isUntitled) {
                let addNum = 0
                let deleteNum = 0

                for (let i of event.contentChanges) {
                    addNum += i.text.length
                    deleteNum += i.rangeLength
                }

                updateCodeChange(context, addNum, deleteNum)
            }
        })

        vscode.window.onDidChangeTextEditorSelection((event) => {
            updateCodingDuration(context)
        })

        setInterval(
            () => {
                saveTracking(context)
            },
            1000 * 60 * 2
        )
    })

    let resetState = vscode.commands.registerCommand('cpt.resetState', () => {
        context.workspaceState.keys().forEach((key) => {
            context.workspaceState.update(key, undefined)
        })
        console.log('workspaceState was reset!')
    })

    context.subscriptions.push(veTest)
    context.subscriptions.push(resetState)
}

function deactivate() {}

module.exports = {
    activate,
    deactivate,
}
