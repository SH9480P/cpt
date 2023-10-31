import { ExtensionContext } from 'vscode'
import * as dayjs from 'dayjs'
import * as utc from 'dayjs/plugin/utc'
import * as minMax from 'dayjs/plugin/minMax'
import { CodeChange } from '../interface/codeChange.interface'
import { Complete } from '../interface/complete.interface'
import { CodingDuration } from '../interface/codingDuration.interface'
import { HelloWorldPanel } from '../panels/HelloWorldPanel'

dayjs.extend(utc)
dayjs.extend(minMax)

const CODE_CHANGE_KEY = 'codeChange'
const CODING_DURATION_KEY = 'codingDuration'
const COMPLETE_KEY = 'complete'

function extractYMDHmFromDayjsObject(dayjsObject: dayjs.Dayjs) {
    const minutes = dayjsObject.minute()
    if (minutes < 30) {
        dayjsObject = dayjsObject.set('minute', 0)
    } else {
        dayjsObject = dayjsObject.set('minute', 30)
    }

    return dayjsObject.toISOString().substring(0, 16) + 'Z'
}

function getNextYMDHm(YMDHm: string) {
    const nextDate = dayjs.utc(YMDHm).add(30, 'm')
    return extractYMDHmFromDayjsObject(nextDate)
}

function extractYearMonthString(YMDHm: string) {
    const keyDate = dayjs.utc(YMDHm)
    return `${keyDate.year()}-${keyDate.month()}`
}

export function updateCodeChange(context: ExtensionContext, addNum: number, deleteNum: number) {
    if (addNum !== 0 || deleteNum !== 0) {
        const now = dayjs.utc()
        const currentYMDHm = extractYMDHmFromDayjsObject(now)
        const currentKey = CODE_CHANGE_KEY

        let changeObject = context.workspaceState.get<CodeChange>(currentKey)
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
        context.workspaceState.update(currentKey, changeObject)
    }
}

function updateCompleteCodeChange(
    context: ExtensionContext,
    addNum: number,
    deleteNum: number,
    YMDHm: string
) {
    const completeState = context.workspaceState.get<Complete>(COMPLETE_KEY)!
    const yearMonth = extractYearMonthString(YMDHm)
    if (completeState[yearMonth] === undefined) {
        completeState[yearMonth] = []
    }
    for (let i = completeState[yearMonth].length - 1; i >= 0; i--) {
        if (completeState[yearMonth][i].YMDHm === YMDHm) {
            completeState[yearMonth][i].addTotal = addNum
            completeState[yearMonth][i].deleteTotal = deleteNum
            context.workspaceState.update(COMPLETE_KEY, completeState)
            return
        }
    }
    completeState[yearMonth].push({ YMDHm, addTotal: addNum, deleteTotal: deleteNum, longTotal: 0 })
    context.workspaceState.update(COMPLETE_KEY, completeState)
}

export function updateCodingDuration(context: ExtensionContext) {
    const now = dayjs.utc()
    const currentYMDHm = extractYMDHmFromDayjsObject(now)
    const currentKey = CODING_DURATION_KEY

    let durationObject = context.workspaceState.get<CodingDuration>(currentKey)
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
                dayjs.min(durationObject.lastTriggeredTime.add(30, 's'), now)!.diff(nextYMDHm),
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
                .min(now, durationObject.lastTriggeredTime.add(30, 's'))!
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
    context.workspaceState.update(currentKey, durationObject)
}

function updateCompleteCodingDuration(context: ExtensionContext, longTotal: number, YMDHm: string) {
    const completeState = context.workspaceState.get<Complete>(COMPLETE_KEY)!
    const yearMonth = extractYearMonthString(YMDHm)

    if (completeState[yearMonth] === undefined) {
        completeState[yearMonth] = []
    }
    for (let i = completeState[yearMonth].length - 1; i >= 0; i--) {
        if (completeState[yearMonth][i].YMDHm === YMDHm) {
            completeState[yearMonth][i].longTotal = longTotal
            context.workspaceState.update(COMPLETE_KEY, completeState)
            return
        }
    }
    completeState[yearMonth].push({ YMDHm, addTotal: 0, deleteTotal: 0, longTotal: longTotal })
    context.workspaceState.update(COMPLETE_KEY, completeState).then(() => {
        if (HelloWorldPanel.currentPanel) {
            HelloWorldPanel.currentPanel.sendMessageToVSCode('getWorkspaceState', context)
        }
    })
}

export function saveTracking(context: ExtensionContext) {
    const now = dayjs.utc()
    const currentYMDHm = extractYMDHmFromDayjsObject(now)

    const codeChangeObject = context.workspaceState.get<CodeChange>(CODE_CHANGE_KEY)
    if (codeChangeObject !== undefined) {
        const { addTotal, deleteTotal, YMDHm: ccYMDHm } = codeChangeObject
        updateCompleteCodeChange(context, addTotal, deleteTotal, ccYMDHm)
        if (ccYMDHm !== currentYMDHm) {
            context.workspaceState.update(CODE_CHANGE_KEY, undefined)
        }
    }
    const codingDurationObject = context.workspaceState.get<CodingDuration>(CODING_DURATION_KEY) //TODO: 30분 지나기 직전의 codingDuration에 대해 30초 분할 계산 필요함
    if (codingDurationObject !== undefined) {
        const { longTotal, YMDHm: cdYMDHm } = codingDurationObject
        updateCompleteCodingDuration(context, longTotal, cdYMDHm)
        if (cdYMDHm !== currentYMDHm) {
            context.workspaceState.update(CODING_DURATION_KEY, undefined)
        }
    }
}
