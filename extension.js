const vscode = require('vscode')
const path = require('path')
const fsPromises = require('fs/promises')

function getStateKeyFromCurrentTimeStamp() {
    const now = new Date()
    const minutes = now.getMinutes()
    if (minutes < 30) {
        now.setMinutes(0)
    } else {
        now.setMinutes(30)
    }

    return now.toISOString().substring(0, 16) + 'Z'
}

// cpt 디렉토리가 있는지 확인하고 없으면 생성, 주소 반환.
// TODO: 확장 프로그램 설치 시 or 시작 시 cpt 디렉토리 생성하기
// TODO: createDirectory Sync로 변경하기
function getStorageDirPath(context) {
    const storageUri = context.storageUri
    const storageDirName = path.join(path.dirname(storageUri.path), 'cpt')

    return fsPromises
        .access(storageDirName)
        .catch(() =>
            vscode.workspace.fs.createDirectory(
                vscode.Uri.parse(storageDirName)
            )
        )
        .then(() => storageDirName)
}

function getJSONFileNameFromStateKey(stateKey) {
    const keyDate = new Date(stateKey)
    return `${keyDate.getUTCFullYear()}-${keyDate.getUTCMonth() + 1}.json`
}

function getDateHourMinuteFromStateKey(stateKey) {
    const keyDate = new Date(stateKey)
    return `${keyDate.getUTCDate()}-${keyDate.getUTCHours()}-${keyDate.getUTCMinutes()}`
}

// 파일 읽고 데이터 추가하여 다시 쓰기
async function updateStorageFile(context, stateKey, changeObject) {
    const fileName = getJSONFileNameFromStateKey(stateKey)
    const storageDirPath = await getStorageDirPath(context)
    const storageFileUri = vscode.Uri.parse(
        path.join(storageDirPath, fileName)
    )

    const fileData = await vscode.workspace.fs.readFile(storageFileUri)
    let fileObject = []
    if (fileData.length !== 0) {
        fileObject = JSON.parse(fileData.toString())
    }
    fileObject.push({
        ...changeObject,
        date: getDateHourMinuteFromStateKey(stateKey),
    })

    vscode.workspace.fs.writeFile(
        storageFileUri,
        Buffer.from(JSON.stringify(changeObject))
    )
}

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    console.log('Congratulations, your extension "cpt" is now active!')

    let veTest = vscode.commands.registerCommand('cpt.veTest', () => {
        vscode.workspace.onDidChangeTextDocument((event) => {
            if (!event.document.isUntitled) {
                let addNum = 0
                let deleteNum = 0

                for (let i of event.contentChanges) {
                    addNum += i.text.length
                    deleteNum += i.rangeLength
                }

                if (addNum !== 0 || deleteNum !== 0) {
                    const key = getStateKeyFromCurrentTimeStamp()
                    let changeObject = context.workspaceState.get(key)
                    if (changeObject === undefined) {
                        changeObject = { addTotal: 0, deleteTotal: 0 }

                        // workspaceState에 저장된 값을 json 파일에 저장
                        context.workspaceState.keys().forEach((key) => {
                            const priorChangeObject =
                                context.workspaceState.get(key)
                            context.workspaceState.update(key, undefined)

                            updateStorageFile(context, key, priorChangeObject)
                        })
                    }

                    context.workspaceState.update(key, {
                        addTotal: changeObject.addTotal + addNum,
                        deleteTotal: changeObject.deleteTotal + deleteNum,
                    })
                    console.log(context.workspaceState.get(key))
                }
            }
        })
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
        })
    )
}

function deactivate() {}

module.exports = {
    activate,
    deactivate,
}
