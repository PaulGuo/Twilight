<style scoped>
    .progressbar {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    }

    .btn-group {
        margin-top: 14px;
        text-align: center;
    }
</style>

<template>
<div id="wrapper">
    <div class="progressbar">
        <el-progress type="circle" :status="pStatus" :percentage="pPercentage"></el-progress>
        <div class="btn-group">
            <el-button type="danger" @click="stopAndBack">终止</el-button>
        </div>
    </div>
</div>
</template>


<script>
    export default {
        name: 'upload-progress',

        data() {
            return {
                taskId: null,
                file: null,
                pStatus: '',
                pPercentage: 0
            };
        },

        methods: {
            goBack() {
                this.$router.back(); // FIXME ?
            },

            stopAndBack() {
                const ipc = this.$electron.ipcRenderer;

                ipc.on('renderer:virtual-metrics:analyse-stopped', (event, tid) => {
                    this.goBack();
                });

                ipc.send('main:virtual-metrics:stop-analyse', this.taskId);
            },

            processVideo() {
                const ipc = this.$electron.ipcRenderer;

                ipc.on('renderer:virtual-metrics:analyse-started', (event, tid) => {
                    console.log(tid);
                });

                ipc.on(
                    'renderer:virtual-metrics:analyse-success',
                    (event, tid, images) => {
                        console.log(images);
                        this.$router.push({
                            name: 'choose-frames'
                        });
                    }
                );

                ipc.on(
                    'renderer:virtual-metrics:analyse-failure',
                    (event, tid, err) => {
                        console.log(err);
                        this.goBack();
                    }
                );

                ipc.send('main:virtual-metrics:start-analyse', this.file);
            }
        },

        mounted() {
            const query = this.$route.query;
            if (query.file) {
                this.file = query.file;
                this.processVideo();
            } else {
                // TODO: error tip
                this.goBack();
            }
        }
    };
</script>
