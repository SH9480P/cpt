import {
    commands,
    Disposable,
    ExtensionContext,
    NotebookCellStatusBarItem,
    StatusBarAlignment,
    StatusBarItem,
    window,
    workspace,
} from 'vscode'
import { updateCodeChange, updateCodingDuration, saveTracking } from './lib/workspaceStateHandler'
import { ChartPanel } from './panels/ChartPanel'

let codeChangeEventListener: Disposable | undefined = undefined
let codingDurationEventListener: Disposable | undefined = undefined
let saveTrackingInterval: NodeJS.Timer | undefined = undefined

function startCodeTracking(context: ExtensionContext) {
    if (!codeChangeEventListener) {
        codeChangeEventListener = workspace.onDidChangeTextDocument((event) => {
            if (!event.document.isUntitled && event.document.languageId !== 'log') {
                let addNum = 0
                let deleteNum = 0

                for (let i of event.contentChanges) {
                    addNum += i.text.length
                    deleteNum += i.rangeLength
                }

                updateCodeChange(context, addNum, deleteNum)
            }
        })
    }

    if (!codingDurationEventListener) {
        codingDurationEventListener = window.onDidChangeTextEditorSelection((event) => {
            updateCodingDuration(context)
        })
    }

    if (!saveTrackingInterval) {
        saveTrackingInterval = setInterval(
            () => {
                saveTracking(context)
                console.log(context.workspaceState.get('complete'))
            },
            1000 * 60 * 2
        )
    }
}

function stopCodeTracking(context: ExtensionContext) {
    if (codeChangeEventListener) {
        codeChangeEventListener.dispose()
        codeChangeEventListener = undefined
    }
    if (codingDurationEventListener) {
        codingDurationEventListener.dispose()
        codingDurationEventListener = undefined
    }
    if (saveTrackingInterval) {
        clearTimeout(saveTrackingInterval)
        saveTrackingInterval = undefined
    }
}

function removeAllData(context: ExtensionContext) {
    context.workspaceState.update('complete', undefined)
    context.workspaceState.update('codeChange', undefined)
    context.workspaceState.update('codingDuration', undefined)
    console.log('workspaceState was reset!')
}

function renderWebViewPanel(context: ExtensionContext) {
    ChartPanel.render(context.extensionUri, context)
    console.log('panel open!')
}

function toggleStatusBar(statusBarItem: StatusBarItem) {
    if (statusBarItem.command === 'passiometer.start-tracking') {
        statusBarItem.command = 'passiometer.stop-tracking'
        statusBarItem.text = '■ Tracking..'
    } else {
        statusBarItem.command = 'passiometer.start-tracking'
        statusBarItem.text = '▶ Stopped'
    }
}

export function activate(context: ExtensionContext) {
    console.log('Congratulations, your extension "passiometer" is now active!')

    if (context.workspaceState.get('complete') === undefined) {
        context.workspaceState.update('complete', {})
    }

    let statusBarItem = window.createStatusBarItem(StatusBarAlignment.Right)
    statusBarItem.command = 'passiometer.start-tracking'
    statusBarItem.text = '▶ Stopped'
    statusBarItem.tooltip = "coder's passiometer"
    statusBarItem.show()

    let startTracking = commands.registerCommand('passiometer.start-tracking', () => {
        startCodeTracking(context)
        toggleStatusBar(statusBarItem)
    })
    let stopTracking = commands.registerCommand('passiometer.stop-tracking', () => {
        stopCodeTracking(context)
        toggleStatusBar(statusBarItem)
    })
    let resetState = commands.registerCommand('passiometer.reset-state', () => {
        removeAllData(context)
    })
    let openWebView = commands.registerCommand('passiometer.open-webview', () => {
        renderWebViewPanel(context)
    })

    context.subscriptions.push(startTracking)
    context.subscriptions.push(stopTracking)
    context.subscriptions.push(resetState)
    context.subscriptions.push(openWebView)
    context.subscriptions.push(statusBarItem)
}

export function deactivate() {}
