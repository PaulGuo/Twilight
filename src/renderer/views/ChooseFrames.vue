<style scoped lang="scss">
    #choose {
        height: 100%;
    }

    .preview {
        height: calc(100% - 120px);
        background: #ace;
        position: relative;

        img {
            max-width: 400px;
            max-height: 400px;
            box-shadow: 0 0 4px 1px rgba(0, 0, 0, 0.4);
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        }
    }

    .gallery {
        width: 100%;
        height: 120px;
        overflow-x: scroll;
        overflow-y: hidden;
        background: #eee;

        ul {
            width: 10000px;
        }

        li {
            height: 100px;
            margin: 10px;
            float: left;
            box-shadow: 0 0 4px 1px rgba(0, 0, 0, 0.4);

            &.current {
                outline: 1px solid red;
            }
        }

        img {
            height: 100px;
        }
    }
</style>

<template>
    <div id="choose" @keyup.enter="keyNextImage">
        <div class="preview">
            <img :src="'file://' + images[currentIdx]" />
        </div>
        <div class="gallery">
            <ul>
                <li v-for="(img, idx) in images"
                    @click="previewImage(idx)"
                    :class="{current: idx===currentIdx}"
                    >
                    <img :src="'file://' + img" />
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
            images: [],
            currentIdx: 0
        };
    },
    methods: {
        previewImage(idx) {
            this.currentIdx = idx;
        },
        keyNextImage() {
            if (this.currentIdx + 1 < this.images.length) {
                this.currentIdx++;
            }
        },
        keyPrevImage() {
            if (this.currentIdx > 0) {
                this.currentIdx--;
            }
        },
        initShortcut() {
            document.addEventListener('keyup', (event) => {
                if (event.keyCode === 39) {
                    this.keyNextImage();
                } else if (event.keyCode === 37) {
                    this.keyPrevImage();
                }
            });
        },
    },
    mounted() {
        const images = this.$state.get('images');
        console.log(images);
        this.images = images;
        this.initShortcut();
    }
};
</script>
