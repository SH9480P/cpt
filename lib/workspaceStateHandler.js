const vscode = require('vscode')

const CODE_CHANGE_PREFIX = 'codeChange'
const CODING_DURATION_PREFIX = 'codingDuration'
const COMPLETE_PREFIX = 'complete'
const codeChangeKey = (yearToMinute) => `${CODE_CHANGE_PREFIX}:${yearToMinute}`
const codingDurationKey = (yearToMinute) => `${CODING_DURATION_PREFIX}:${yearToMinute}`
const completeKey = (yearMonth) => `${COMPLETE_PREFIX}:${yearMonth}`
const extractTimeFromKey = (key) => key.split(':')[1]

function extractYearToMinuteFromCurrentTimeStamp() {
    const now = new Date()
    const minutes = now.getMinutes()
    if (minutes < 30) {
        now.setMinutes(0)
    } else {
        now.setMinutes(30)
    }

    return now.toISOString().substring(0, 16) + 'Z'
}

/**
 * @param {vscode.ExtensionContext} context
 */
function getStateValue(context, key) {
    return context.workspaceState.get(key)
}

/**
 * @param {vscode.ExtensionContext} context
 */
function updateStateValue(context, key, value) {
    return context.workspaceState.update(key, value)
}

function updateCodeChange(context, addNum, deleteNum) {
    if (addNum !== 0 || deleteNum !== 0) {
        const yearToMinute = extractYearToMinuteFromCurrentTimeStamp()
        const currentKey = codeChangeKey(yearToMinute)

        let changeObject = getStateValue(context, currentKey)
        if (changeObject === undefined) {
            changeObject = { addTotal: 0, deleteTotal: 0 }
        }

        updateStateValue(context, currentKey, {
            addTotal: changeObject.addTotal + addNum,
            deleteTotal: changeObject.deleteTotal + deleteNum,
        })
    }
}

function extractYearMonthString(yearToMinute) {
    const keyDate = new Date(yearToMinute)
    return `${keyDate.getUTCFullYear()}-${keyDate.getUTCMonth() + 1}`
}

function extractDateHourMinuteString(yearToMinute) {
    const keyDate = new Date(yearToMinute)
    return `${keyDate.getUTCDate()}-${keyDate.getUTCHours()}-${keyDate.getUTCMinutes()}`
}

module.exports = {
    updateCodeChange,
}
