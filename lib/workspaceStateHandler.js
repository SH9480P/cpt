const vscode = require('vscode')
const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')

dayjs.extend(utc)

const CODE_CHANGE_PREFIX = 'codeChange'
const CODING_DURATION_PREFIX = 'codingDuration'
const COMPLETE_PREFIX = 'complete'
const codeChangeKey = (yearToMinute) => `${CODE_CHANGE_PREFIX}:${yearToMinute}`
const codingDurationKey = (yearToMinute) => `${CODING_DURATION_PREFIX}:${yearToMinute}`
const completeKey = (yearMonth) => `${COMPLETE_PREFIX}:${yearMonth}`
const extractTimeFromKey = (key) => key.split(':')[1]

function extractYearToMinuteFromDayjsObject(dayjsObject) {
    const minutes = dayjsObject.minute()
    if (minutes < 30) {
        dayjsObject.set('minute', 0)
    } else {
        dayjsObject.set('minute', 30)
    }

    return dayjsObject.toISOString().substring(0, 16) + 'Z'
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

// TODO: workspaceState에 저장하는 형태 변경 고려(codeChange:~~ -> codechange 객체에 yearToMinute를 key로 하는 객체를 넣는 형태)
/**
 * @param {vscode.ExtensionContext} context
 * @param {number} addNum
 * @param {number} deleteNum
 */
function updateCodeChange(context, addNum, deleteNum) {
    if (addNum !== 0 || deleteNum !== 0) {
        const now = dayjs.utc()
        const yearToMinute = extractYearToMinuteFromDayjsObject(now)
        const currentKey = codeChangeKey(yearToMinute)

        let changeObject = getStateValue(context, currentKey)
        if (changeObject === undefined) {
            changeObject = { addTotal: addNum, deleteTotal: deleteNum }
            updateStateValue(context, currentKey, changeObject)
            return
        }
        changeObject.addTotal += addNum
        changeObject.deleteTotal += deleteNum
    }
}

/**
 * @param {vscode.ExtensionContext} context
 */
function updateCodingDuration(context) {
    const now = dayjs.utc()
    const yearToMinute = extractYearToMinuteFromDayjsObject(now)
    const currentKey = codingDurationKey(yearToMinute)

    let durationObject = getStateValue(context, currentKey)
    if (durationObject === undefined) {
        durationObject = {
            firstTriggeredTime: now,
            lastTriggeredTime: now,
            longTotal: 0,
        }
        updateStateValue(context, currentKey, durationObject)
        return
    } else if (durationObject.lastTriggeredTime === null && durationObject.firstTriggeredTime === null) {
        durationObject.firstTriggeredTime = now
        durationObject.lastTriggeredTime = now
        return
    } else if (now.diff(durationObject.lastTriggeredTime) > 1000 * 10) {
        durationObject.longTotal +=
            durationObject.lastTriggeredTime.diff(durationObject.firstTriggeredTime) + 1000 * 10
        durationObject.firstTriggeredTime = now
    }
    durationObject.lastTriggeredTime = now
}

function extractYearMonthString(yearToMinute) {
    const keyDate = dayjs.utc(yearToMinute)
    return `${keyDate.year()}-${keyDate.month()}`
}

function extractDateHourMinuteString(yearToMinute) {
    const keyDate = dayjs.utc(yearToMinute)
    return `${keyDate.date()}-${keyDate.hour()}-${keyDate.minute()}`
}

function getStateKeysWithPrefix(context, prefix) {
    return context.workspaceState.keys().filter((key) => key.startsWith(prefix))
}

function saveTracking(context) {
    const now = dayjs.utc()
    const yearToMinute = extractYearToMinuteFromDayjsObject(now)

    // save codeChange
    const codeChangeKeys = getStateKeysWithPrefix(context, CODE_CHANGE_PREFIX)
    for (const key of codeChangeKeys) {
        const keyISOString = extractTimeFromKey(key)
        const yearMonth = extractYearMonthString(keyISOString)
        const dateHourMinute = extractDateHourMinuteString(keyISOString)

        const codeChangeValue = getStateValue(context, key)
        const trackingCompleteValue = getStateValue(context, completeKey(yearMonth))
        trackingCompleteValue[dateHourMinute].addTotal = codeChangeValue.addTotal
        trackingCompleteValue[dateHourMinute].deleteTotal = codeChangeValue.deleteTotal
        
        if (keyISOString !== yearToMinute) {
            updateStateValue(context, key, undefined)
        }
    }

    // save codingDuration
    const codingDurationKeys = getStateKeysWithPrefix(context, CODING_DURATION_PREFIX)
    for (const key of codingDurationKeys) {
        const keyISOString = extractTimeFromKey(key)
        const yearMonth = extractYearMonthString(keyISOString)
        const dateHourMinute = extractDateHourMinuteString(keyISOString)

        const codingDurationValue = getStateValue(context, key)
        const trackingCompleteValue = getStateValue(context, completeKey(yearMonth))

        const lastFirstDiff = codingDurationValue.lastTriggeredTime.diff(codingDurationValue.firstTriggeredTime)
        
        if (keyISOString !== yearToMinute) {
            const tenSecondsLater = codingDurationValue.lastTriggeredTime.add(10, 's')
            const nextThirtyMinutes = dayjs.utc(keyISOString).add(30, 'm')
            if (tenSecondsLater.isAfter(nextThirtyMinutes)) {
                trackingCompleteValue[dateHourMinute].longTotal = codingDurationValue.longTotal + nextThirtyMinutes.diff(codingDurationValue.lastTriggeredTime)
                // 다음 시간대에 잔여 시간 추가

            } else {
                trackingCompleteValue[dateHourMinute].longTotal = codingDurationValue.longTotal + lastFirstDiff
            }
            //삭제
            updateStateValue(context, key, undefined)
        } else if (now.diff(codingDurationValue.lastTriggeredTime) > 1000 * 10) {
            codingDurationValue.longTotal += lastFirstDiff + 1000 * 10
            trackingCompleteValue[dateHourMinute].longTotal = codingDurationValue.longTotal
            codingDurationValue.firstTriggeredTime = null
            codingDurationValue.lastTriggeredTime = null
        }
    }
}

module.exports = {
    updateCodeChange,
    updateCodingDuration,
    saveTracking,
}
