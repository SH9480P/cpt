const vscode = require('vscode')
const { updateCodeChange, updateCodingDuration, saveTracking } = require('./lib/workspaceStateHandler')

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    console.log('Congratulations, your extension "cpt" is now active!')
    //TODO: complete, codeChange, codingTime workspaceState 초기화 필요

    let veTest = vscode.commands.registerCommand('cpt.veTest', () => {
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
            1000 * 60 * 3
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

    context.subscriptions.push(
        vscode.commands.registerCommand('cpt.cpttest', () => {
            vscode.window.showInformationMessage('Just For test')
            context.workspaceState.update('test', { t: 1, e: 2 })
            let a = context.workspaceState.get('test')
            a.e = 1000
            console.log(context.workspaceState.get('test'))
        })
    )
}

function deactivate() {}

module.exports = {
    activate,
    deactivate,
}
