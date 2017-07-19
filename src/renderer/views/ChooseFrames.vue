<template>
    <div id="wrapper">
      <p>choose</p>
  </div>
</template>

<script>
export default {
    name: 'choose-frames',
    components: {},
    methods: {
        open(link) {
            this.$electron.shell.openExternal(link);
        }
    }
};
</script>

<style>


</style>
