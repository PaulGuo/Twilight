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
        <v-choose v-else
            :images="images"
            :stop="goBack"
            :start="startAnalyse"
            ></v-choose>
    </div>
</template>

<script>
import vSpinner from '@renderer/components/SpinnerStop.vue';
import vChoose from './Choose.vue';

export default {
    components: {
        vSpinner,
        vChoose,
    },

    data() {
        return {
            processing: true,
            images: [],
        };
    },

    methods: {
        _cleanup_ipc() {
            const ipc = this.$electron.ipcRenderer;
            ipc.removeAllListeners('renderer:visual-metrics-extract:analyse-started');
            ipc.removeAllListeners('renderer:visual-metrics-extract:analyse-stopped');
            ipc.removeAllListeners('renderer:visual-metrics-extract:analyse-success');
            ipc.removeAllListeners('renderer:visual-metrics-extract:analyse-failure');
        },

        goBack() {
            this._cleanup_ipc();
            this.$state.clear('images');
            this.$state.clear('frames');
            this.$router.back();
        },
        goTo(path) {
            this._cleanup_ipc();
            this.$state.clear('images');
            this.$router.push(path);
        },

        stopProcessAndGoBack() {
            const ipc = this.$electron.ipcRenderer;

            ipc.on('renderer:visual-metrics-extract:analyse-stopped', (event, tid) => {
                this.goBack();
            });

            ipc.send('main:visual-metrics-extract:stop-analyse', this.taskId);
        },
        processVideo(video) {
            const ipc = this.$electron.ipcRenderer;

            ipc.on('renderer:visual-metrics-extract:analyse-started', (event, tid) => {
                console.log(tid);
            });

            ipc.on(
                'renderer:visual-metrics-extract:analyse-success',
                (event, tid, images) => {
                    this.$state.set('images', images);
                    this.startChoose(images);
                },
            );

            ipc.on(
                'renderer:visual-metrics-extract:analyse-failure',
                (event, tid, err) => {
                    console.log(err);
                    alert(err);
                    this.goBack();
                },
            );

            ipc.send('main:visual-metrics-extract:start-analyse', video);
        },

        startChoose(images) {
            this.images = images;
            this.processing = false;
        },
        startAnalyse(frames) {
            this.$state.set('frames', frames);
            this.goTo('analyse-result');
        },
    },

    mounted() {
        const video = this.$state.get('video');
        const images = this.$state.get('images');
        if (images) {
            this.startChoose(images);
        } else {
            this.processVideo(video);
        }
    },
};
</script>
