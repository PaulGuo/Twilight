<style scoped lang="scss">
    .wrapper {
        width: 100%;
        height: 100%;
        position: relative;
    }

    .spin {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    }

    .spinner {
        margin: 30px auto;
        width: 50px;
        height: 40px;
        text-align: center;
        font-size: 10px;
    }

    .rect {
        background-color: #fff;
        height: 100%;
        width: 6px;
        display: inline-block;
        animation: sk-stretchdelay 1.2s infinite ease-in-out;
    }

    .rect2 {
        animation-delay: -1.1s;
    }

    .rect3 {
        animation-delay: -1.0s;
    }

    .rect4 {
        animation-delay: -0.9s;
    }

    .rect5 {
        animation-delay: -0.8s;
    }

    @-webkit-keyframes sk-stretchdelay {
        0%, 40%, 100% { transform: scaleY(0.4) }
        20% { transform: scaleY(1.0) }
    }

    @keyframes sk-stretchdelay {
        0%, 40%, 100% {
            transform: scaleY(0.4);
        }
        20% {
            transform: scaleY(1.0);
        }
    }
</style>

<template>
    <div class="wrapper">
        <div class="spin">
            <div class="spinner">
                <div class="rect rect1"></div>
                <div class="rect rect2"></div>
                <div class="rect rect3"></div>
                <div class="rect rect4"></div>
                <div class="rect rect5"></div>
            </div>
            <slot></slot>
        </div>
    </div>
</template>
