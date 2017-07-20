<style lang="scss">
    #upload {
        .video-uploader .el-upload {
            border: 3px dashed #fff;
            border-radius: 6px;
            cursor: pointer;
            position: relative;
            overflow: hidden;
        }

        .video-uploader .el-upload:hover {
            border-color: #3498DB;
        }

        .video-uploader-icon {
            font-size: 28px;
            color: #fff;
            width: 378px;
            height: 278px;
            line-height: 278px;
            text-align: center;
        }
    }
</style>

<style scoped>
    #upload {
        height: 100%;
    }

    .upload-container {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    }

    .video {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    }

    .video-content {
        box-shadow: 0 0 15px 1px rgba(0, 0, 0, 0.4);
        max-width: 320px;
        max-height: 480px;
    }

    .video-btns {
        text-align: center;
        margin-top: 25px;
    }

    .upload-container-title {
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
</style>

<template>
    <div id="upload">
        <div v-if="video" class="video">
            <video class="video-content" controls muted :src="'file://' + video"></video>
            <div class="video-btns">
                <el-button @click="cleanup">重新选择</el-button>
                <el-button type="primary" @click="upload">开始分析</el-button>
            </div>
        </div>
        <div v-else class="upload-container">
            <h1 class="upload-container-title">DRAG SCREEN RECORD HERE</h1>
            <el-upload class="video-uploader"
                accept="video/*"
                action="/"
                type="drag"
                :multiple="false"
                :before-upload="beforeUpload">
                <i class="el-icon-plus video-uploader-icon"></i>
            </el-upload>
        </div>
        <div class="footer">
            ♥ Design and Implementation by PaulGuo and nirisix
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            video: null,
        };
    },
    methods: {
        beforeUpload(file) {
            this.video = file.path;
            return false;
        },
        upload() {
            this.$state.set('video', this.video);
            this.$router.push('choose-frames');
        },
        cleanup() {
            this.video = null;
        },
    },
};
</script>
