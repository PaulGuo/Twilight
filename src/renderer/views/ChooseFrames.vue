<style scoped lang="scss">
    #choose {
        height: 100%;
        background: #1ABC9C;
    }

    .box-group {
        height: calc(100% - 120px);
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
                border: 3px dashed #d9d9d9;
                border-radius: 6px;

                i {
                    font-size: 28px;
                    color: #d9d9d9;
                    width: 200px;
                    height: 300px;
                    line-height: 300px;
                    text-align: center;
                }
            }
        }

        .start {
        }
        .fcp {
        }
        .fmp {
        }
        .end {
        }
    }

    .gallery {
        width: 100%;
        height: 120px;
        overflow-x: auto;
        overflow-y: hidden;
        background: #eee;

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
</style>

<template>
    <div id="choose">
        <div class="box-group">
            <div class="box"
                @dragover.prevent="over($event)"
                @drop.prevent="drop($event, frame)"
                v-for="frame in Object.keys(frames)">
                <img v-if="frames[frame]" :src="'file://' + frames[frame]" />
                <div v-else class="placeholder">
                    <i class="el-icon-plus"></i>
                </div>
            </div>
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
    name: 'choose-frames',
    data() {
        return {
            frames: {
                start: null,
                fc: null,
                fm: null,
                end: null
            },
            images: []
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
        }
    },
    mounted() {
        const images = this.$state.get('images');
        this.images = images;
    }
};
</script>
