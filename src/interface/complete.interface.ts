interface PartialStatistics {
    YMDHm: string

    longTotal: number

    addTotal: number

    deleteTotal: number
}

export interface Complete {
    [yearMonth: string]: PartialStatistics[]
}
