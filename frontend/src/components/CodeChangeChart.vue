<template>
    <Bar id="code-change-chart" :options="chartOptions" :data="getBarData" />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { Bar } from 'vue-chartjs'
import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    BarElement,
    CategoryScale,
    LinearScale,
    type TooltipItem,
    type ChartType,
} from 'chart.js'
import dayjs from 'dayjs'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

export default defineComponent({
    name: 'CodeChangeChart',
    props: {
        increments: Array<number>,
        decrements: Array<number>,
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
                            callback(this: CategoryScale, value: number, index: number): string {
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
                        stacked: true,
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
                            footer: function (context: TooltipItem<ChartType>[]) {
                                const dataIdx = context[0].dataIndex
                                return `Total: ${context[0].chart.data.datasets
                                    .reduce((acc, dataset) => acc + dataset.data[dataIdx], 0)
                                    .toLocaleString()}`
                            },
                        },
                        footerAlign: 'right',
                        footerFont: {
                            weight: 'normal',
                        },
                        mode: 'index',
                    },
                },
            },
        }
    },
    components: {
        Bar,
    },
    computed: {
        getBarData() {
            return {
                labels: this.labels,
                datasets: [
                    {
                        label: 'increment',
                        data: this.increments || [],
                        backgroundColor: '#F6D365',
                        maxBarThickness: 30,
                    },
                    {
                        label: 'decrement',
                        data: this.decrements || [],
                        backgroundColor: '#64C4ED',
                        maxBarThickness: 30,
                    },
                ],
            }
        },
    },
})
</script>

<style scoped>
#code-change-chart {
    letter-spacing: normal;
}
</style>
