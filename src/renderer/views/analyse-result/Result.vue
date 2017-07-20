<style scoped lang="scss">
    .result {
        height: 100%;
        width: 100%;
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
        font-size: 30px;

        div {
            flex: 1;
            text-align: center;
            align-self: center;
        }
    }

    .chart {
        height: calc(100% - 100px - 100px);
        background: #16A085;
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
                <span>{{result.FCP}}</span>
            </div>
            <div>
                <span>FMP</span>
                <span>{{result.FMP}}</span>
            </div>
            <div>
                <span>FVC</span>
                <span>{{result.FirstVisualChange}}</span>
            </div>
            <div>
                <span>LVC</span>
                <span>{{result.LastVisualChange}}</span>
            </div>
        </div>
        <div class="chart">
        </div>
    </div>
</template>

<script>
export default {
    props: {
        result: {
            type: Object,
            required: true,
        }
    },
    data() {
        return {
        };
    },
    methods: {
    },
    mounted() {
        console.log(this.result);
    }
};
</script>
