<script lang="ts">
    let { open } = $props();
</script>

<div class="hamburger-container">
    {#if open}
        <div class="x-icon"></div>
    {:else}
        <div class="menu-icon">
            <div class="bar"></div>
            <div class="bar"></div>
            <div class="bar"></div>
        </div>
    {/if}
</div>

<style>
    .hamburger-container {
        padding: 10px;
        justify-content: center;
        align-items: center;
    }

    .menu-icon {
        display: inline-block;
        .bar {
            margin: 3px;
            width: 25px;
            height: 3px;
            background: #000;
            border-radius: 1.5px;
        }
    }

    .x-icon {
        &::before,
        &::after {
            content: "";
            display: block;
            margin-top: -3px;
            width: 20px;
            height: 3px;
            background: #000;
            border-radius: 1px;
        }

        &::before {
            -webkit-transform: rotate(-45deg);
            -ms-transform: rotate(-45deg);
            transform: rotate(-45deg);
        }
        &::after {
            -webkit-transform: rotate(45deg);
            -ms-transform: rotate(45deg);
            transform: rotate(45deg);
        }
    }
</style>
