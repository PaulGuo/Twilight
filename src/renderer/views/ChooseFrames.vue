<template>
    <div id="wrapper">
        <p>ha</p>
    </div>
</template>

<script>
export default {
    name: 'choose-frames',
    data() {
        return {
            images: [],
        };
    },
    methods: {
    },
    mounted() {
        const images = this.$state.get('images');
        console.log(images);
        this.images = images;
    },
};
</script>

<style>
</style>
