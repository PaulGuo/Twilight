<style scoped lang="scss">
    .spinner {
        width: 100%;
        height: 100%;
    }

    .spinner-action-group {
        margin-top: 14px;
        text-align: center;
    }
</style>

<template>
    <div class="spinner">
        <v-spinner>
            <div class="spinner-action-group">
                <el-button type="danger" @click="stop">终止</el-button>
            </div>
        </v-spinner>
    </div>
</template>

<script>
import vSpinner from '@renderer/components/Spinner.vue';

export default {
    components: {
        vSpinner,
    },
    props: {
        stop: {
            type: Function,
            required: true,
        },
    },
};
</script>
