<template>
  <div id="wrapper">
    <el-upload
      class="video-uploader"
      action="https://jsonplaceholder.typicode.com/posts/"
      :show-file-list="false"
      :on-success="handleVideoSuccess"
      :before-upload="beforeVideoUpload">
      <img v-if="imageUrl" :src="imageUrl" class="avatar">
      <i v-else class="el-icon-plus video-uploader-icon"></i>
    </el-upload>
  </div>
</template>

<script>
  export default {
    name: 'upload-page',
    components: {},
    methods: {
      open (link) {
        this.$electron.shell.openExternal(link)
      }
    }
  }
</script>

<style>
  .video-uploader {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  .video-uploader .el-upload {
    border: 3px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  .video-uploader .el-upload:hover {
    border-color: #20a0ff;
  }
  .video-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 378px;
    height: 278px;
    line-height: 278px;
    text-align: center;
  }
</style>
