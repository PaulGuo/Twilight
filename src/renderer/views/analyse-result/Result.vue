<style scoped lang="scss">
    .result {
        height: 100%;
        width: 100%;
        position: relative;
    }

    .speed {
        height: 100px;
        display: flex;
        font-size: 30px;

        div {
            flex: 1;
            text-align: center;
            align-self: center;
        }
    }

    .visual {
        height: 100px;
        display: flex;
        font-size: 28px;

        div {
            flex: 1;
            text-align: center;
            align-self: center;
            span {
                display: block;
            }
        }
    }

    .chart {
        width: 100%;
        height: calc(100% - 100px - 100px);
        padding: 10px 20px;
        background: #ecf0f1;
    }

    .close {
        position: absolute;
        cursor: pointer;
        left: 10px;
        top: 10px;
        display: inline-block;
        width: 40px;
        height: 40px;
        color: #7f8c8d;
        border: 2px solid #7f8c8d;
        border-radius: 50%;
        text-align: center;
        line-height: 30px;

        .icon {
            font-size: 40px;
        }
    }
</style>

<template>
    <div class="result">
        <div class="speed">
            <div class="si">
                <span>SI</span>
                <span>{{result.SpeedIndex}}ms</span>
            </div>
            <div class="psi">
                <span>PSI</span>
                <span>{{result.PerceptualSpeedIndex}}ms</span>
            </div>
        </div>
        <div class="visual">
            <div>
                <span>FCP</span>
                <span>{{result.FCP}}ms</span>
            </div>
            <div>
                <span>FMP</span>
                <span>{{result.FMP}}ms</span>
            </div>
            <div>
                <span>FVC</span>
                <span>{{result.FirstVisualChange}}ms</span>
            </div>
            <div>
                <span>LVC</span>
                <span>{{result.LastVisualChange}}ms</span>
            </div>
        </div>
        <div class="chart">
            <canvas ref="canvas" class="canvas" width="980" height="420"></canvas>
        </div>
    </div>
</template>

<script>
    import Chart from 'chart.js';

    export default {
        props: {
            result: {
                type: Object,
                required: true
            },
            back: {
                type: Function,
                required: true
            }
        },
        methods: {
            renderChart() {
                const result = this.result;
                const labels = result.SpeedIndexChart.map(x => x[0]);
                const dataSI = result.SpeedIndexChart.map(x => x[1]);
                const dataPSI = result.PerceptualSpeedIndexChart.map(
                    x => Math.round(x[1] * 100) / 100
                );
                const ctx = this.$refs.canvas.getContext('2d');
                const chart = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: labels,
                        datasets: [
                            {
                                steppedLine: true,
                                label: 'SI',
                                yAxisID: 'y-si',
                                data: dataSI,
                                backgroundColor: 'rgba(231,76,60,.5)'
                            },
                            {
                                steppedLine: true,
                                label: 'PSI',
                                yAxisID: 'y-psi',
                                data: dataPSI,
                                backgroundColor: 'rgba(52,152,219,.5)'
                            }
                        ]
                    },
                    options: {
                        scales: {
                            yAxes: [
                                {
                                    id: 'y-si',
                                    type: 'linear',
                                    position: 'left',
                                    ticks: {
                                        min: 0,
                                        max: 100
                                    }
                                },
                                {
                                    id: 'y-psi',
                                    type: 'linear',
                                    position: 'right',
                                    ticks: {
                                        min: 0,
                                        max: 1
                                    }
                                }
                            ],
                            xAxes: [
                                {
                                    type: 'time',
                                    time: {
                                        unit: 'millisecond',
                                        round: 'true',
                                        min: 0,
                                        displayFormats: {
                                            millisecond: 'x',
                                            second: 'x',
                                            minute: 'x',
                                            hour: 'x',
                                            day: 'x',
                                            week: 'x',
                                            month: 'x',
                                            quarter: 'x',
                                            year: 'x'
                                        }
                                    }
                                }
                            ]
                        }
                    }
                });
                return chart;
            }
        },
        mounted() {
            console.log(this.result);
            this.renderChart();
        }
    };
</script>
