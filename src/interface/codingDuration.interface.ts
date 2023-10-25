import { Dayjs } from 'dayjs'

export interface CodingDuration {
    YMDHm: string

    longTotal: number

    lastTriggeredTime: Dayjs
}