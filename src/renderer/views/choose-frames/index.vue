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
        goBack() {
            this.$router.back();
        },

        stopProcessAndGoBack() {
            const ipc = this.$electron.ipcRenderer;

            ipc.on('renderer:visual-metrics:analyse-stopped', (event, tid) => {
                this.goBack();
            });

            ipc.send('main:visual-metrics:stop-analyse', this.taskId);
        },
        processVideo(video) {
            const ipc = this.$electron.ipcRenderer;

            ipc.on('renderer:visual-metrics:analyse-started', (event, tid) => {
                console.log(tid);
            });

            ipc.on(
                'renderer:visual-metrics:analyse-success',
                (event, tid, images) => {
                    this.$state.set('images', images);
                    this.startChoose(images);
                },
            );

            ipc.on(
                'renderer:visual-metrics:analyse-failure',
                (event, tid, err) => {
                    console.log(err);
                    alert(err);
                    this.goBack();
                },
            );

            ipc.send('main:visual-metrics:start-analyse', video);
        },

        startChoose(images) {
            this.images = images;
            this.processing = false;
        },
        startAnalyse(frames) {
            this.$state.clear('result');
            this.$state.set('frames', frames);
            this.$router.push('/analyse-result');
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
