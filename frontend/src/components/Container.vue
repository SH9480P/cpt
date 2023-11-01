<template>
    <div class="container-wrapper mt-2 mx-auto">
        <!-- Nav tabs -->
        <ul class="nav nav-underline mb-3">
            <li class="nav-item">
                <p class="nav-link active clickable" data-bs-toggle="tab" href="#home">Home</p>
            </li>
            <li class="nav-item">
                <p class="nav-link clickable" data-bs-toggle="tab" href="#daily">Daily</p>
            </li>
            <li class="nav-item">
                <p class="nav-link clickable" data-bs-toggle="tab" href="#monthly">Monthly</p>
            </li>
        </ul>
        <!-- Tab panes -->
        <div class="tab-content">
            <div class="tab-pane active" id="home">
                <div class="d-flex">
                    <div class="m-3 mt-1 p-4 today-panel">
                        <TodayTotal :complete="complete"></TodayTotal>
                    </div>
                    <div class="m-3 mt-1 p-4 recent-panel flex-fill">
                        <RecentData :complete="complete"></RecentData>
                    </div>
                </div>
            </div>
            <div class="tab-pane" id="daily">
                <DailyData :complete="complete"></DailyData>
            </div>
            <div class="tab-pane" id="monthly">
                <MonthlyData :complete="complete"></MonthlyData>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import TodayTotal from './TodayTotal.vue'
import RecentData from './RecentData.vue'
import DailyData from './DailyData.vue'
import MonthlyData from './MonthlyData.vue'

export default defineComponent({
    name: 'Container',
    data() {
        return {
            showHome: true,
        }
    },
    components: {
        TodayTotal,
        RecentData,
        DailyData,
        MonthlyData,
    },
    props: {
        complete: Object,
    },
})
</script>

<style scoped>
.container-wrapper {
    height: 550px;
    width: 1000px;
}

.today-panel {
    min-width: 350px;
    height: 400px;
    background-color: #414141;
    border: 4px solid #414141;
    border-radius: 10px;
}

.recent-panel {
    height: 500px;
    background-color: #414141;
    border: 4px solid #414141;
    border-radius: 10px;
}

.clickable {
    cursor: pointer;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
}

.nav-link {
    color: #eee;
}

.nav-item > .active {
    border-bottom-color: #ec625f;
    color: #eee;
}
</style>
