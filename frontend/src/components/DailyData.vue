<template>
    <div class="d-flex daily-panel">
        <div class="m-1 p-3">
            <h3 class="mb-4 text-center">Daily Records</h3>
            <VueDatePicker
                id="calendar"
                v-model="today"
                :enable-time-picker="false"
                inline
                auto-apply
                :dark="true"
            />
        </div>
        <div class="mt-1 p-2 flex-fill">
            <div class="mb-2 code-change-wrapper">
                <CodeChangeChart
                    :labels="getDailyChartData.labels"
                    :increments="getDailyChartData.increments"
                    :decrements="getDailyChartData.decrements"
                    type="daily"
                />
            </div>
            <div class="mb-2 coding-duration-wrapper">
                <CodingDurationChart
                    :labels="getDailyChartData.labels"
                    :durations="getDailyChartData.durations"
                    type="daily"
                />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import CodeChangeChart from './CodeChangeChart.vue'
import CodingDurationChart from './CodingDurationChart.vue'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)

export default defineComponent({
    name: 'DailyData',
    components: { VueDatePicker, CodeChangeChart, CodingDurationChart },
    props: {
        complete: Object,
    },
    data() {
        return {
            today: new Date(),
        }
    },
    computed: {
        getDailyChartData() {
            const todayDayjs = dayjs(this.today).set('hour', 0).set('minute', 0).set('second', 0).set('ms', 0)
            const thisMonth = todayDayjs.month()
            const thisDate = todayDayjs.date()
            const labels = []
            let iDayjs = dayjs(todayDayjs)
            while (iDayjs.month() === thisMonth && iDayjs.date() === thisDate) {
                labels.push(this.extractYMDHmFromDayjsObject(iDayjs.utc()))
                iDayjs = iDayjs.add(30, 'minute')
                // console.log(iDayjs.format())
            }

            const increments = []
            const decrements = []
            const durations = []
            for (let YMDHm of labels) {
                const yearMonth = this.extractYearMonthString(YMDHm)
                let addNum = 0
                let deleteNum = 0
                let duration = 0

                if (this.complete && this.complete[yearMonth]) {
                    for (let i = 0; i < this.complete[yearMonth].length; i++) {
                        if (this.complete[yearMonth][i].YMDHm === YMDHm) {
                            addNum = this.complete[yearMonth][i].addTotal
                            deleteNum = this.complete[yearMonth][i].deleteTotal
                            duration = this.complete[yearMonth][i].longTotal
                            break
                        } else if (this.complete[yearMonth][i].YMDHm > YMDHm) {
                            break
                        }
                    }
                }
                increments.push(addNum)
                decrements.push(deleteNum)
                durations.push(duration)
            }
            return {
                increments,
                decrements,
                durations,
                labels,
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
    height: 50%;
}

.coding-duration-wrapper {
    height: 50%;
}

.daily-panel {
    width: 110%;
    height: 500px;
    background-color: #414141;
    border: 4px solid #414141;
    border-radius: 10px;
}

#calendar {
    letter-spacing: normal;
}
</style>
