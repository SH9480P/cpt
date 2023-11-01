import {
    Disposable,
    Webview,
    WebviewPanel,
    window,
    Uri,
    ViewColumn,
    ExtensionContext,
    Extension,
} from 'vscode'
import { getUri } from '../lib/getUri'
import { getNonce } from '../lib/getNonce'

export class ChartPanel {
    public static currentPanel: ChartPanel | undefined
    private readonly _panel: WebviewPanel
    private _disposables: Disposable[] = []

    private constructor(panel: WebviewPanel, extensionUri: Uri, extension: ExtensionContext) {
        this._panel = panel

        this._panel.onDidDispose(() => this.dispose(), null, this._disposables)

        this._panel.webview.html = this._getWebviewContent(this._panel.webview, extensionUri)

        this._setWebviewMessageListener(this._panel.webview, extension)
    }

    public static render(extensionUri: Uri, extension: ExtensionContext) {
        if (ChartPanel.currentPanel) {
            ChartPanel.currentPanel._panel.reveal(ViewColumn.One)
        } else {
            const panel = window.createWebviewPanel('showHelloWorld', 'Hello World', ViewColumn.One, {
                enableScripts: true,
                localResourceRoots: [
                    Uri.joinPath(extensionUri, 'out'),
                    Uri.joinPath(extensionUri, 'frontend/build'),
                    Uri.joinPath(extensionUri, 'node_modules'),
                ],
            })

            ChartPanel.currentPanel = new ChartPanel(panel, extensionUri, extension)
        }
    }

    public dispose() {
        ChartPanel.currentPanel = undefined

        this._panel.dispose()

        while (this._disposables.length) {
            const disposable = this._disposables.pop()
            if (disposable) {
                disposable.dispose()
            }
        }
    }

    private _getWebviewContent(webview: Webview, extensionUri: Uri) {
        const stylesUri = getUri(webview, extensionUri, ['frontend', 'build', 'assets', 'index.css'])
        const scriptUri = getUri(webview, extensionUri, ['frontend', 'build', 'assets', 'index.js'])
        const bootstrapIconsUri = webview.asWebviewUri(
            Uri.joinPath(extensionUri, 'node_modules', 'bootstrap-icons', 'font', 'bootstrap-icons.css')
        )

        const nonce = getNonce()

        return /*html*/ `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}'; font-src ${webview.cspSource};">
          <link rel="stylesheet" type="text/css" href="${stylesUri}">
          <link rel="stylesheet" href="${bootstrapIconsUri}">
          <title>Hello World</title>
        </head>
        <body>
          <div id="app"></div>
          <script type="module" nonce="${nonce}" src="${scriptUri}"></script>
        </body>
      </html>
    `
    }

    private _setWebviewMessageListener(webview: Webview, extension: ExtensionContext) {
        webview.onDidReceiveMessage(
            (message: any) => {
                const command = message.command
                const text = message.text

                switch (command) {
                    case 'hello':
                        window.showInformationMessage(text)
                        return
                    case 'start':
                        this.sendMessageToVSCode('start', extension)
                        return
                }
            },
            undefined,
            this._disposables
        )
    }

    public sendMessageToVSCode(command: string, extension: ExtensionContext) {
        this._panel.webview.postMessage({
            command: command,
            content: extension.workspaceState.get('complete'),
        })
    }
}
