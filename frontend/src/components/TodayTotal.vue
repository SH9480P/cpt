<template>
    <div>
        <h3 class="text-center">Today's Passion</h3>
        <div class="mt-4">
            <div class="row p-3">
                <div class="col-3 index-head d-flex flex-column me-3">
                    <i class="bi bi-arrow-up-square-fill arrow-up"></i>
                </div>
                <div class="col-8 d-flex flex-column justify-content-center">
                    <div class="index-value">{{ getTodayTotal.increment }} chars</div>
                    <div class="index-label arrow-up">Increment</div>
                </div>
            </div>
            <div class="row p-3">
                <div class="col-3 index-head d-flex flex-column me-3">
                    <i class="bi bi-arrow-down-square-fill arrow-down"></i>
                </div>
                <div class="col-8 d-flex flex-column justify-content-center">
                    <div class="index-value">{{ getTodayTotal.decrement }} chars</div>
                    <div class="index-label arrow-down">Decrement</div>
                </div>
            </div>
            <div class="row p-3">
                <div class="col-3 index-head d-flex flex-column me-3">
                    <i class="bi bi-stopwatch-fill stopwatch"></i>
                </div>
                <div class="col-8 d-flex flex-column justify-content-center">
                    <div class="index-value">{{ getTodayTotal.duration }}</div>
                    <div class="index-label stopwatch">Duration</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(timezone)

export default defineComponent({
    name: 'TodayTotal',
    methods: {
        getYearMonth(now: dayjs.Dayjs) {
            return `${now.year()}-${now.month()}`
        },
        isToday(now: dayjs.Dayjs, YMDHm: string) {
            const localeNow = now.tz(dayjs.tz.guess())
            const someday = dayjs(YMDHm)
            if (
                localeNow.year() === someday.year() &&
                localeNow.month() === someday.month() &&
                localeNow.date() === someday.date()
            ) {
                return true
            }
            return false
        },
        getMinutes(milliseconds: number) {
            return (milliseconds / (1000 * 60)).toFixed(2)
        },
        getSeconds(milliseconds: number) {
            return (milliseconds / 1000).toFixed(2)
        },
        getDurationWithUnit(milliseconds: number) {
            if (milliseconds < 1000 * 60) {
                return `${this.getSeconds(milliseconds)} secs`
            }
            return `${this.getMinutes(milliseconds)} mins`
        },
    },
    computed: {
        getTodayTotal() {
            const now = dayjs.utc()
            const nowYearMonth = this.getYearMonth(now)
            let increment = 0
            let decrement = 0
            let durationInMS = 0
            if (this.complete && this.complete[nowYearMonth]) {
                for (let obj of this.complete[nowYearMonth]) {
                    if (this.isToday(now, obj.YMDHm)) {
                        increment += obj.addTotal
                        decrement += obj.deleteTotal
                        durationInMS += obj.longTotal
                    }
                }
            }
            return { increment, decrement, duration: this.getDurationWithUnit(durationInMS) }
        },
    },
    props: {
        complete: Object,
    },
})
</script>

<style scoped>
.index-value {
    font-size: 1.2rem;
    font-weight: 600;
}
.index-label {
    font-size: 0.9rem;
}

i {
    font-size: 3rem;
}

.stopwatch {
    color: #ec625f;
}
.arrow-down {
    color: #64c4ed;
}

.arrow-up {
    color: #f6d365;
}
</style>
