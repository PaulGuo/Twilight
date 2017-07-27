<style scoped lang="scss">
    .wrapper {
        height: 100%;
    }

    .video {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);

        .video-content {
            box-shadow: 0 0 15px 1px rgba(0, 0, 0, 0.4);
            max-width: 320px;
            max-height: 480px;
        }

        .video-btns {
            text-align: center;
            margin-top: 25px;
        }
    }

    .upload {
        position: relative;
        width: 100%;
        height: 100%;

        .form {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        }

        .title {
            text-align: center;
            margin-bottom: 25px;
            opacity: 0.3;
        }

        .footer {
            position: absolute;
            bottom: 15px;
            width: 100%;
            text-align: center;
            font-size: 13px;
            font-family: "Hiragino Kaku Gothic ProN";
            opacity: 0.5;
        }

        .upload-container {
            display: block;
            position: relative;
            width: 300px;
            height: 400px;
            border: 3px dashed #fff;
            border-radius: 6px;
            cursor: pointer;
            text-align: center;
            font-size: 50px;

            input {
                visibility: hidden;
                display: block;
                width: 0;
                height: 0;
            }

            .icon {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
            }
        }
    }
</style>

<template>
    <div class="wrapper">
        <div v-if="video" class="video">
            <video class="video-content" controls muted :src="'file://' + video"></video>
            <div class="video-btns">
                <button @click="cleanup">重新选择</button>
                <button class="btn-primary" @click="upload">开始分析</button>
            </div>
        </div>
        <div v-else class="upload">
            <div class="form">
                <h1 class="title">DRAG SCREEN RECORD HERE</h1>
                <label class="upload-container">
                    <input type="file" accept="video/*" @change="inputChange">
                    <i class="icon">+</i>
                </label>
            </div>
            <div class="footer">
                ♥ Design and Implementation by PaulGuo and niris
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                video: null
            };
        },
        methods: {
            inputChange(event) {
                const files = event.target.files;
                if (files.length) {
                    const file = files[0];
                    this.video = file.path;
                }
            },
            upload() {
                this.$state.set('video', this.video);
                this.$router.push('choose-frames');
            },
            cleanup() {
                this.video = null;
            },
            onOver(event) {
                event.preventDefault();
            },
            onDrop(event) {
                event.preventDefault();
                const dt = event.dataTransfer;
                if (dt.files && dt.files.length) {
                    const file = dt.files[0];
                    this.video = file.path;
                }
            },
            initDragDrop() {
                document.addEventListener('dragover', this.onOver);
                document.addEventListener('drop', this.onDrop);
            },
            removeDragDrop() {
                document.removeEventListener('dragover', this.onOver);
                document.removeEventListener('drop', this.onDrop);
            }
        },
        mounted() {
            this.initDragDrop();
        },

        destroyed() {
            this.removeDragDrop();
        }
    };
</script>
