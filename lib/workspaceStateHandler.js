const vscode = require('vscode')

const CODE_CHANGE_PREFIX = 'codeChange'
const CODING_DURATION_PREFIX = 'codingDuration'
const COMPLETE_PREFIX = 'complete'
const codeChangeKey = (yearToMinute) => `${CODE_CHANGE_PREFIX}:${yearToMinute}`
const codingDurationKey = (yearToMinute) => `${CODING_DURATION_PREFIX}:${yearToMinute}`
const completeKey = (yearMonth) => `${COMPLETE_PREFIX}:${yearMonth}`
const extractTimeFromKey = (key) => key.split(':')[1]

function extractYearToMinuteFromDateObject(dateObject) {
    const minutes = dateObject.getMinutes()
    if (minutes < 30) {
        dateObject.setMinutes(0)
    } else {
        dateObject.setMinutes(30)
    }

    return dateObject.toISOString().substring(0, 16) + 'Z'
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

/**
 * @param {vscode.ExtensionContext} context
 * @param {number} addNum
 * @param {number} deleteNum
 */
function updateCodeChange(context, addNum, deleteNum) {
    if (addNum !== 0 || deleteNum !== 0) {
        const now = new Date()
        const yearToMinute = extractYearToMinuteFromDateObject(now)
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

/**
 * @param {vscode.ExtensionContext} context
 */
function updateCodingDuration(context) {
    const now = new Date()
    const yearToMinute = extractYearToMinuteFromDateObject(now)
    const currentKey = codingDurationKey(yearToMinute)

    let durationObject = getStateValue(context, currentKey)
    if (durationObject === undefined) {
        durationObject = {
            firstTriggeredTime: now,
            lastTriggeredTime: now,
            longTotal: 0,
        }
    } else if (now.getTime() - durationObject.lastTriggeredTime.getTime() > 1000 * 10) {
        durationObject.longTotal +=
            durationObject.lastTriggeredTime.getTime() -
            durationObject.firstTriggeredTime.getTime() +
            1000 * 10
        durationObject.firstTriggeredTime = now
    }
    durationObject.lastTriggeredTime = now

    updateStateValue(context, currentKey, durationObject)
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
    updateCodingDuration,
}
