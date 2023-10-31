<template>
    <Line id="coding-duration-chart" :options="chartOptions" :data="getLineData" />
</template>

<script lang="ts">
import { defineComponent, toRaw } from 'vue'
import { Line } from 'vue-chartjs'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Scale,
    Filler,
    type TooltipItem,
    type ChartType,
    type ScriptableContext,
} from 'chart.js'
import dayjs from 'dayjs'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

export default defineComponent({
    name: 'CodeDurationChart',
    props: {
        durations: Array<number>,
        labels: Array<string|number>,
        type: String,
    },
    data() {
        return {
            chartOptions: {
                maintainAspectRatio: false,
                color: '#aaa',
                scales: {
                    x: {
                        stacked: true,
                        ticks: {
                            callback(this: Scale, value: number, index: number): string {
                                if (!isNaN(Number(this.getLabelForValue(value))) && index % 2 == 0) {
                                    return this.getLabelForValue(value)
                                }
                                else if ((this.max > 40 && index % 6 == 0) || (this.max <= 40 && index % 2 == 0)) {
                                    return dayjs(this.getLabelForValue(value)).format('HH:mm')
                                }
                                return ''
                            },
                            color: '#aaa',
                            maxRotation: 0,
                        },
                        grid: {
                            display: false,
                        },
                    },
                    y: {
                        min: 0,
                        ticks: {
                            color: '#aaa',
                        },
                    },
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            title: function (context: TooltipItem<ChartType>[]) {
                                if (isNaN(Number(context[0].label))) {
                                    return dayjs(context[0].label).format('HH:mm')
                                }
                                return context[0].label + ' Day'
                            },
                        },
                        mode: 'index',
                        intersect: false,
                    },
                },
            },
        }
    },
    components: {
        Line,
    },
    computed: {
        getLineData() {
            return {
                labels: this.labels,
                datasets: [
                    {
                        label: 'seconds',
                        data: toRaw(this.durations)?.map((ms) => Math.floor(ms / 1000)) || [],
                        fill: true,
                        backgroundColor: function (context: ScriptableContext<'line'>) {
                            const canvas = context.chart.ctx
                            const chartArea = context.chart.chartArea
                            if (!chartArea) {
                                return
                            }
                            const gradient = canvas.createLinearGradient(
                                0,
                                chartArea.top,
                                0,
                                chartArea.bottom
                            )
                            gradient.addColorStop(0, 'rgba(236, 98, 95, 0.6)')
                            gradient.addColorStop(0.5, 'rgba(236, 98, 95, 0.4)')
                            gradient.addColorStop(1, 'rgba(236, 98, 95, 0.2)')
                            return gradient
                        },
                        tension: 0.2,
                        pointRadius: function (context: ScriptableContext<'line'>) {
                            return context.raw === 0 ? 0 : 2
                        },
                        pointBackgroundColor: '#eee',
                        borderColor: '#EC625F',
                        borderWidth: 0.5,
                    },
                ],
            }
        },
    },
})
</script>

<style scoped>
#coding-duration-chart {
    letter-spacing: normal;
}
</style>
