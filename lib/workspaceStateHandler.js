const vscode = require('vscode')
const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
const minMax = require('dayjs/plugin/minMax')

dayjs.extend(utc)
dayjs.extend(minMax)

const CODE_CHANGE_KEY = 'codeChange'
const CODING_DURATION_KEY = 'codingDuration'
const COMPLETE_KEY = 'complete'

function extractYMDHmFromDayjsObject(dayjsObject) {
    const minutes = dayjsObject.minute()
    if (minutes < 30) {
        dayjsObject.set('minute', 0)
    } else {
        dayjsObject.set('minute', 30)
    }

    return dayjsObject.toISOString().substring(0, 16) + 'Z'
}

function getNextYMDHm(YMDHm) {
    const nextDate = dayjs.utc(YMDHm).add(30, 'm')
    return extractYMDHmFromDayjsObject(nextDate)
}

function extractYearMonthString(YMDHm) {
    const keyDate = dayjs.utc(YMDHm)
    return `${keyDate.year()}-${keyDate.month()}`
}

/**
 * @param {vscode.ExtensionContext} context
 * @param {number} addNum
 * @param {number} deleteNum
 */
function updateCodeChange(context, addNum, deleteNum) {
    if (addNum !== 0 || deleteNum !== 0) {
        const now = dayjs.utc()
        const currentYMDHm = extractYMDHmFromDayjsObject(now)
        const currentKey = CODE_CHANGE_KEY

        let changeObject = context.workspaceState.get(currentKey)
        if (changeObject === undefined) {
            changeObject = { addTotal: addNum, deleteTotal: deleteNum, YMDHm: currentYMDHm }
            context.workspaceState.update(currentKey, changeObject)
            return
        }
        if (changeObject.YMDHm !== currentYMDHm) {
            updateCompleteCodeChange(
                context,
                changeObject.addTotal,
                changeObject.deleteTotal,
                changeObject.YMDHm
            )
            changeObject.YMDHm = currentYMDHm
            changeObject.addTotal = addNum
            changeObject.deleteTotal = deleteNum
        } else {
            changeObject.addTotal += addNum
            changeObject.deleteTotal += deleteNum
        }
    }
}

function updateCompleteCodeChange(context, addNum, deleteNum, YMDHm) {
    const completeState = context.workspaceState.get(COMPLETE_KEY)
    const yearMonth = extractYearMonthString(YMDHm)
    if (completeState[yearMonth] === undefined) {
        completeState[yearMonth] = []
    }
    for (let i = completeState[yearMonth].length - 1; i >= 0; i--) {
        if (completeState[yearMonth][i].YMDHm === YMDHm) {
            completeState[yearMonth][i].addTotal = addNum
            completeState[yearMonth][i].deleteTotal = deleteNum
            return
        }
    }
    completeState[yearMonth].push({ YMDHm, addTotal: addNum, deleteTotal: deleteNum, longTotal: 0 })
}

/**
 * @param {vscode.ExtensionContext} context
 */
function updateCodingDuration(context) {
    const now = dayjs.utc()
    const currentYMDHm = extractYMDHmFromDayjsObject(now)
    const currentKey = CODING_DURATION_KEY

    let durationObject = context.workspaceState.get(currentKey)
    if (durationObject === undefined) {
        durationObject = {
            lastTriggeredTime: now,
            longTotal: 0,
            YMDHm: currentYMDHm,
        }
        context.workspaceState.update(currentKey, durationObject)
        return
    }

    if (durationObject.YMDHm !== currentYMDHm) {
        const nextYMDHm = getNextYMDHm(durationObject.YMDHm)
        if (dayjs(nextYMDHm).diff(durationObject.lastTriggeredTime.add(30, 's')) > 0) {
            updateCompleteCodingDuration(context, durationObject.longTotal + 30 * 1000, durationObject.YMDHm)
        } else {
            updateCompleteCodingDuration(
                context,
                durationObject.longTotal + dayjs(nextYMDHm).diff(durationObject.lastTriggeredTime),
                durationObject.YMDHm
            )
            updateCompleteCodingDuration(
                context,
                dayjs.min(durationObject.lastTriggeredTime.add(30, 's'), now).diff(nextYMDHm),
                nextYMDHm
            )
        }

        durationObject.YMDHm = currentYMDHm
        durationObject.longTotal = 0
        if (
            nextYMDHm === currentYMDHm &&
            durationObject.lastTriggeredTime.add(30, 's').isAfter(dayjs(currentYMDHm))
        ) {
            durationObject.longTotal = dayjs
                .min(now, durationObject.lastTriggeredTime.add(30, 's'))
                .diff(dayjs(currentYMDHm))
        }
        durationObject.lastTriggeredTime = now
    } else {
        const msDiff = now.diff(durationObject.lastTriggeredTime)
        if (msDiff < 1000 * 30) {
            durationObject.longTotal += msDiff
        } else {
            durationObject.longTotal += 1000 * 30
        }
        durationObject.lastTriggeredTime = now
    }
}

function updateCompleteCodingDuration(context, longTotal, YMDHm) {
    const completeState = context.workspaceState.get(COMPLETE_KEY)
    const yearMonth = extractYearMonthString(YMDHm)
    if (completeState[yearMonth] === undefined) {
        completeState[yearMonth] = []
    }
    for (let i = completeState[yearMonth].length - 1; i >= 0; i--) {
        if (completeState[yearMonth][i].YMDHm === YMDHm) {
            completeState[yearMonth][i].longTotal = longTotal
            return
        }
    }
    completeState[yearMonth].push({ YMDHm, addTotal: 0, deleteTotal: 0, longTotal: longTotal })
}

function saveTracking(context) {
    const now = dayjs.utc()
    const currentYMDHm = extractYMDHmFromDayjsObject(now)

    const codeChangeObject = context.workspaceState.get(CODE_CHANGE_KEY)
    const { addTotal, deleteTotal, ccYMDHm } = codeChangeObject
    updateCompleteCodeChange(context, addTotal, deleteTotal, ccYMDHm)
    if (ccYMDHm !== currentYMDHm) {
        context.workspace.update(CODE_CHANGE_KEY, undefined)
    }
    const codingDurationObject = context.workspaceState.get(CODING_DURATION_KEY)
    const { longTotal, cdYMDHm } = codingDurationObject
    updateCompleteCodingDuration(context, longTotal, cdYMDHm)
    if (cdYMDHm !== currentYMDHm) {
        context.workspace.update(CODING_DURATION_KEY, undefined)
    }
}

module.exports = {
    updateCodeChange,
    updateCodingDuration,
    saveTracking,
}
