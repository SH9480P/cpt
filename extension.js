const vscode = require('vscode')

function getKeyFromCurrentTimeStamp() {
    const now = new Date()
    const minutes = now.getMinutes()
    if (minutes < 30) {
        now.setMinutes(0)
    }
    else {
        now.setMinutes(30)
    }
    
    return now.toISOString().substring(0, 16) + 'Z'    
}

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    console.log('Congratulations, your extension "cpt" is now active!')

    let veTest = vscode.commands.registerCommand(
        'cpt.veTest',
        () => {
            vscode.workspace.onDidChangeTextDocument((event) => {
                if (!event.document.isUntitled) {
                    let addNum = 0
                    let deleteNum = 0
    
                    for (let i of event.contentChanges) {
                        addNum += i.text.length
                        deleteNum += i.rangeLength
                    }

                    if (addNum !== 0 || deleteNum !== 0) {
                        const key = getKeyFromCurrentTimeStamp()
                        let changeObject = context.workspaceState.get(key)
                        if (changeObject === undefined) {
                           changeObject = {addTotal: 0, deleteTotal: 0} 
                        }
    
                        context.workspaceState.update(key, {addTotal: changeObject.addTotal+addNum, deleteTotal: changeObject.deleteTotal+deleteNum})
                        console.log(context.workspaceState.get(key))
                    }
                }
            })
        }
    )

    let resetState = vscode.commands.registerCommand(
        'cpt.resetState',
        () => {
            context.workspaceState.keys().forEach((key) => {
                context.workspaceState.update(key, undefined)
            })
            console.log('workspaceState was reset!')
        }
    )

    context.subscriptions.push(veTest)
    context.subscriptions.push(resetState)
}

function deactivate() {}

module.exports = {
    activate,
    deactivate,
}
