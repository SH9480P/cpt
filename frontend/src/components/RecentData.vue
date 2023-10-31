<template>
    <h3 class="ps-3">Recent 4 Hours</h3>
    <div class="mt-2 code-change-wrapper">
        <CodeChangeChart
            :increments="getRecentChartData.increments"
            :decrements="getRecentChartData.decrements"
            :labels="getRecentChartData.labels"
            type="recent"
        />
    </div>
    <div class="mt-2 coding-duration-wrapper">
        <CodingDurationChart
            :durations="getRecentChartData.durations"
            :labels="getRecentChartData.labels"
            type="recent"
        />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import CodeChangeChart from './CodeChangeChart.vue'
import CodingDurationChart from './CodingDurationChart.vue'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(timezone)

export default defineComponent({
    name: 'RecentData',
    props: {
        complete: Object,
    },
    components: {
        CodeChangeChart,
        CodingDurationChart,
    },
    computed: {
        getRecentChartData() {
            const now = dayjs.utc()
            const nowYMDHm = this.extractYMDHmFromDayjsObject(now)
            const minDiffArr = [210, 180, 150, 120, 90, 60, 30, 0]
            const labels = minDiffArr.map((minDiff) =>
                this.extractYMDHmFromDayjsObject(dayjs.utc(nowYMDHm).subtract(minDiff, 'minute'))
            )
            const increments = []
            const decrements = []
            const durations = []

            for (let YMDHm of labels) {
                const sometime = dayjs.utc(YMDHm)
                const sometimeYMDHm = this.extractYMDHmFromDayjsObject(sometime)
                const yearMonth = this.extractYearMonthString(sometimeYMDHm)
                let addNum = 0
                let deleteNum = 0
                let duration = 0
                if (this.complete && this.complete[yearMonth]) {
                    for (let i = 0; i < this.complete[yearMonth].length; i++) {
                        if (this.complete[yearMonth][i] && this.complete[yearMonth][i].YMDHm === YMDHm) {
                            addNum = this.complete[yearMonth][i].addTotal
                            deleteNum = this.complete[yearMonth][i].deleteTotal
                            duration = this.complete[yearMonth][i].longTotal
                        }
                    }
                }
                increments.push(addNum)
                decrements.push(deleteNum)
                durations.push(duration)
            }
            return {
                labels,
                increments,
                decrements,
                durations,
            }
        },
    },
    methods: {
        extractYMDHmFromDayjsObject(dayjsObject: dayjs.Dayjs) {
            const minutes = dayjsObject.minute()
            if (minutes < 30) {
                dayjsObject = dayjsObject.set('minute', 0)
            } else {
                dayjsObject = dayjsObject.set('minute', 30)
            }

            return dayjsObject.toISOString().substring(0, 16) + 'Z'
        },
        extractYearMonthString(YMDHm: string) {
            const keyDate = dayjs.utc(YMDHm)
            return `${keyDate.year()}-${keyDate.month()}`
        },
    },
})
</script>

<style scoped>
.code-change-wrapper {
    height: 44%;
}

.coding-duration-wrapper {
    height: 44%;
}
</style>
