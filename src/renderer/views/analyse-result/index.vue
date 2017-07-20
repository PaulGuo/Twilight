<style scoped lang="scss">
    .wrapper {
        width: 100%;
        height: 100%;
    }
</style>

<template>
    <div class="wrapper">
        <v-spinner v-if="processing"
            :stop="stopProcessAndGoBack"
            ></v-spinner>
        <v-result v-else
            :result="result"
            ></v-result>
    </div>
</template>

<script>
import vSpinner from '@renderer/components/SpinnerStop.vue';
import vResult from './Result.vue';

export default {
    components: {
        vSpinner,
        vResult,
    },

    data() {
        return {
            processing: true,
            result: null,
        };
    },

    methods: {
        goBack() {
            this.$state.clear('result');
            this.$router.back();
        },
        goTo(path) {
            this.$state.clear('result');
            this.$router.push(path);
        },

        _extract_time(frame) {
            const pattern = /ms_(\d+)\.jpg$/;
            const matched = pattern.exec(frame);
            if (!matched || !matched[1]) return null;
            return Number(matched[1]);
        },

        stopProcessAndGoBack() {
            const ipc = this.$electron.ipcRenderer;

            ipc.on('renderer:visual-metrics-analyse:analyse-stopped', (event, tid) => {
                this.goBack();
            });

            ipc.send('main:visual-metrics-analyse:stop-analyse', this.taskId);
        },
        processVideo(video, frames) {
            console.log(video, frames);

            const ipc = this.$electron.ipcRenderer;

            ipc.on('renderer:visual-metrics-analyse:analyse-started', (event, tid) => {
                console.log(tid);
            });

            ipc.on(
                'renderer:visual-metrics-analyse:analyse-success',
                (event, tid, result) => {
                    result.FCP = frames.FCP - frames.START;
                    result.FMP = frames.FMP - frames.START;
                    this.$state.set('result', result);
                    this.showResult(result);
                },
            );

            ipc.on(
                'renderer:visual-metrics-analyse:analyse-failure',
                (event, tid, err) => {
                    console.log(err);
                    alert(err);
                },
            );

            ipc.send(
                'main:visual-metrics-analyse:start-analyse',
                video,
                frames.START,
                frames.END,
            );
        },

        showResult(result) {
            this.result = result;
            this.processing = false;
        },
    },

    mounted() {
        const result = this.$state.get('result');
        const video = this.$state.get('video');
        const frames = this.$state.get('frames');
        if (result) {
            this.showResult(result);
        } else {
            const f = {
                START: this._extract_time(frames.START),
                FCP: this._extract_time(frames.FCP),
                FMP: this._extract_time(frames.FMP),
                END: this._extract_time(frames.END),
            };
            this.processVideo(video, f);
        }
    },
};
</script>
