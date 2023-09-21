// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode')

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "cpt" is now active!')

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let hello = vscode.commands.registerCommand(
        'cpt.helloWorld',
        function () {
            // The code you place here will be executed every time your command is executed

            // Display a message box to the user
            vscode.window.showInformationMessage('Hello VSCode!')
        }
    )

    let clock = vscode.commands.registerCommand(
        'cpt.clock',
        function () {
            // The code you place here will be executed every time your command is executed
			let cur = new Date()
            // Display a message box to the user
            vscode.window.showErrorMessage(cur.toISOString())
        }
    )

    context.subscriptions.push(hello)
	context.subscriptions.push(clock)
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
    activate,
    deactivate,
}