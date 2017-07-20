<style scoped lang="scss">
    .choose {
        height: 100%;
        width: 100%;
    }

    .box-group {
        height: calc(100% - 120px - 80px);
        display: flex;

        .box {
            flex: 1;
            text-align: center;
            align-self: center;

            img {
                max-width: 240px;
                max-height: 360px;
                box-shadow: 0 0 4px 1px rgba(0, 0, 0, 0.4);
            }

            .placeholder {
                display: inline-block;
                width: 200px;
                height: 300px;
                border: 3px dashed #fff;
                border-radius: 6px;

                i {
                    font-size: 28px;
                    color: #fff;
                    width: 200px;
                    height: 300px;
                    line-height: 300px;
                    text-align: center;
                }
            }

            .frame-title {
                margin: 10px 0;
            }
        }
    }

    .gallery {
        width: 100%;
        height: 120px;
        overflow-x: auto;
        overflow-y: hidden;
        background: #ECF0F1;

        ul {
            display: block;
            width: -webkit-max-content;
        }

        li {
            display: inline-block;
            height: 100px;
            margin: 10px;
            box-shadow: 0 0 4px 1px rgba(0, 0, 0, 0.4);
        }

        img {
            height: 100px;
        }
    }

    .controls {
        text-align: center;
        height: 80px;
        padding: 22px 0;
    }
</style>

<template>
    <div class="choose">
        <div class="box-group">
            <div class="box"
                @dragover.prevent="over($event)"
                @drop.prevent="drop($event, frame)"
                v-for="frame in Object.keys(frames)">
                <h1 class="frame-title">{{frame}}</h1>
                <img v-if="frames[frame]" :src="'file://' + frames[frame]" />
                <div v-else class="placeholder">
                    <i class="el-icon-plus"></i>
                </div>
            </div>
        </div>
        <div class="controls">
            <el-button type="danger" @click="stop">返回重新选择视频</el-button>
            <el-button type="primary"
                :disabled="!(frames.START && frames.FCP && frames.FMP && frames.END)"
                @click="startAnalyse">开始分析</el-button>
        </div>
        <div class="gallery">
            <ul>
                <li v-for="(img, idx) in images">
                    <img draggable="true"
                    @dragstart="drag($event, img)"
                    :src="'file://' + img"
                    />
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        stop: {
            type: Function,
            required: true,
        },
        start: {
            type: Function,
            required: true,
        },
        images: {
            type: Array,
            required: true,
        },
    },
    data() {
        return {
            frames: {
                START: null,
                FCP: null,
                FMP: null,
                END: null,
            },
        };
    },
    methods: {
        drag(event, img) {
            event.dataTransfer.setData('text/plain', img);
        },
        over(event) {
            event.dataTransfer.dropEffect = 'move';
        },
        drop(event, frame) {
            const img = event.dataTransfer.getData('text');
            this.frames[frame] = img;
        },

        startAnalyse() {
            const frames = [
                this.frames.START,
                this.frames.FCP,
                this.frames.FMP,
                this.frames.END,
            ];
            const isSorted = frames.reduce((l, r) => {
                if (l === false) return false;
                if (l >= r) return false;
                return r;
            });
            if (isSorted === false) {
                alert('图片顺序有误，请重新选择');
                return;
            }
            this.start(this.frames);
        },
    },
};
</script>
