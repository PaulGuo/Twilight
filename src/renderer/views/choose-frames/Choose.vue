<style scoped lang="scss">
    .choose {
        height: 100%;
        width: 100%;
    }

    .box-group {
        height: calc(100% - 135px - 80px);
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
                position: relative;

                .icon {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                }
            }

            .frame-title {
                margin: 10px 0;
            }
        }
    }

    .gallery {
        width: 100%;
        overflow-x: auto;
        height: 135px;
        background: #ecf0f1;

        ul {
            display: block;
            width: max-content;
        }

        li {
            display: inline-block;
            height: 115px;
            margin: 10px;

            span {
                text-align: center;
                color: #34495e;
                display: block;
                height: 10px;
                line-height: 10px;
                font-size: 10px;
                margin-bottom: 5px;
            }

            img {
                height: 100px;
                box-shadow: 0 0 4px 1px rgba(0, 0, 0, 0.4);
            }
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
                    <i class="icon">+</i>
                </div>
            </div>
        </div>
        <div class="controls">
            <button @click="stop">返回重新选择视频</button>
            <button class="btn-primary"
                :disabled="!(frames.START && frames.FCP && frames.FMP && frames.END)"
                @click="startAnalyse">开始分析</button>
        </div>
        <div class="gallery">
            <ul>
                <li v-for="(img, idx) in images">
                    <span class="">{{imgToTime(img)}}</span>
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
    import dateFormatter from './date-formatter.js';
    export default {
        props: {
            stop: {
                type: Function,
                required: true
            },
            start: {
                type: Function,
                required: true
            },
            images: {
                type: Array,
                required: true
            }
        },
        data() {
            return {
                frames: {
                    START: null,
                    FCP: null,
                    FMP: null,
                    END: null
                }
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
                    this.frames.END
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

            _extract_time(frame) {
                const pattern = /ms_(\d+)\.\w+$/;
                const matched = pattern.exec(frame);
                if (!matched || !matched[1]) return null;
                return Number(matched[1]);
            },

            imgToTime(img) {
                const ms = this._extract_time(img);
                const text = dateFormatter(ms, 'mm:ss.SSS');
                return text;
            }
        }
    };
</script>
