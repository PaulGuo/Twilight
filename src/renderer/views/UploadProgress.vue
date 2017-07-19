<style scoped>
    #progress {
        height: 100%;
        background: #1ABC9C;
        width: 100%;
    }

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
<style lang="scss">
    .spinner {
        margin: 30px auto;
        width: 50px;
        height: 40px;
        text-align: center;
        font-size: 10px;
    }

    .spinner > div {
        background-color: white;
        height: 100%;
        width: 6px;
        display: inline-block;
        animation: sk-stretchdelay 1.2s infinite ease-in-out;
    }

    .spinner .rect2 {
        animation-delay: -1.1s;
    }

    .spinner .rect3 {
        animation-delay: -1.0s;
    }

    .spinner .rect4 {
        animation-delay: -0.9s;
    }

    .spinner .rect5 {
        animation-delay: -0.8s;
    }

    @-webkit-keyframes sk-stretchdelay {
        0%, 40%, 100% { transform: scaleY(0.4) }
        20% { transform: scaleY(1.0) }
    }

    @keyframes sk-stretchdelay {
        0%, 40%, 100% {
            transform: scaleY(0.4);
        }
        20% {
            transform: scaleY(1.0);
        }
    }
</style>

<template>
    <div id="progress">
        <div class="progressbar">
            <div class="spinner">
                <div class="rect1"></div>
                <div class="rect2"></div>
                <div class="rect3"></div>
                <div class="rect4"></div>
                <div class="rect5"></div>
            </div>
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
            this.$router.back();
        },

        stopAndBack() {
            const ipc = this.$electron.ipcRenderer;

            ipc.on('renderer:visual-metrics:analyse-stopped', (event, tid) => {
                this.goBack();
            });

            ipc.send('main:visual-metrics:stop-analyse', this.taskId);
        },

        processVideo() {
            const ipc = this.$electron.ipcRenderer;

            ipc.on('renderer:visual-metrics:analyse-started', (event, tid) => {
                console.log(tid);
            });

            ipc.on(
                'renderer:visual-metrics:analyse-success',
                (event, tid, images) => {
                    this.$state.set('images', images);
                    this.$router.push({
                        name: 'choose-frames'
                    });
                }
            );

            ipc.on(
                'renderer:visual-metrics:analyse-failure',
                (event, tid, err) => {
                    console.log(err);
                    this.goBack();
                }
            );

            ipc.send('main:visual-metrics:start-analyse', this.file);
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
