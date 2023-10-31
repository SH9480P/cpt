<template>
    <div class="d-flex daily-panel">
        <div class="m-1 p-3">
            <h3 class="mb-4 text-center">Monthly Records</h3>
            <VueDatePicker
                id="calendar"
                v-model="today"
                :enable-time-picker="false"
                inline
                auto-apply
                :dark="true"
                month-picker
            />
        </div>
        <div class="mt-1 p-2 flex-fill">
            <div class="mb-2 code-change-wrapper">
                <CodeChangeChart
                    :labels="getMonthlyChartData.labels"
                    :increments="getMonthlyChartData.increments"
                    :decrements="getMonthlyChartData.decrements"
                    type="monthly"
                />
            </div>
            <div class="mb-2 coding-duration-wrapper">
                <CodingDurationChart
                    :labels="getMonthlyChartData.labels"
                    :durations="getMonthlyChartData.durations"
                    type="monthly"
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
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(timezone)

export default defineComponent({
    name: 'MonthlyData',
    components: { VueDatePicker, CodeChangeChart, CodingDurationChart },
    props: {
        complete: Object,
    },
    data() {
        return {
            today: {
                year: new Date().getFullYear(),
                month: new Date().getMonth(),
            },
        }
    },
    computed: {
        getMonthlyChartData() {
            const thisMonthDayjs = dayjs().year(this.today.year).month(this.today.month).date(1).hour(0).minute(0).second(0).millisecond(0)
            const nextMonthDayjs = thisMonthDayjs.add(1, 'month')
            const thisMonthYMDHm = this.extractYMDHmFromDayjsObject(thisMonthDayjs.utc())
            const nextMonthYMDHm = this.extractYMDHmFromDayjsObject(nextMonthDayjs.utc())
            const yearMonthUTC = this.extractYearMonthString(thisMonthYMDHm)
            const nextYearMonthUTC = this.extractYearMonthString(nextMonthYMDHm)
            const daysInMonth = thisMonthDayjs.daysInMonth()
            const labels = Array.from({length: daysInMonth}, (value, index) => index + 1)
            const increments = Array.from({length: daysInMonth}, () => 0)
            const decrements = Array.from({length: daysInMonth}, () => 0)
            const durations = Array.from({length: daysInMonth}, () => 0)

            let monthlyComplete = this.complete && this.complete[yearMonthUTC] ? this.complete[yearMonthUTC] : []
            for (let i = 0; i < 2; i++) {
                for (let record of monthlyComplete) {
                    const {YMDHm, addTotal, deleteTotal, longTotal} = record
                    if (YMDHm >= thisMonthYMDHm && YMDHm < nextMonthYMDHm) {
                        const thisDay = dayjs(YMDHm).date()
                        increments[thisDay - 1] += addTotal
                        decrements[thisDay - 1] += deleteTotal
                        durations[thisDay - 1] += longTotal
                    }
                }
                monthlyComplete = this.complete && this.complete[nextYearMonthUTC] ? this.complete[nextYearMonthUTC] : []
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
