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
    </div>
</template>

<script>
import vSpinner from '@renderer/components/SpinnerStop.vue';

export default {
    components: {
        vSpinner,
    },

    data() {
        return {
            processing: true,
        };
    },

    methods: {
        goBack() {
            this.$router.back();
        },

        stopProcessAndGoBack() {
            this.goBack();
        },

        showResult() {},
        processVideo() {},
    },

    mounted() {
        const result = this.$state.get('result');
        const video = this.$state.get('video');
        const frames = this.$state.get('frames');
        if (result) {
            this.showResult(result);
        } else {
            this.processVideo(video, frames);
        }
    },
};
</script>
