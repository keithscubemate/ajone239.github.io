<script lang="ts">
    import Footer from "$lib/components/Footer.svelte";
    import "$lib/styles/styles.scss";
    import "$lib/styles/prism-styles.css";
    import type { LayoutProps } from "./$types";
    import MobileHeader from "$lib/components/MobileHeader.svelte";
    import DesktopHeader from "$lib/components/DesktopHeader.svelte";
    import Sidebar from "$lib/components/Sidebar.svelte";

    let { children }: LayoutProps = $props();

    let open = $state(true);
    let bt = $derived(open ? "c" : "o");

    $inspect(open).with(console.trace);
</script>

<body>
    <header>
        <div class="header-display-desktop">
            <DesktopHeader />
        </div>

        <div class="header-display-mobile">
            <MobileHeader bind:open />
        </div>
    </header>

    <div class="site-wrapper">
        <main>
            <button onclick={() => (open = !open)}>
                {bt}
            </button>

            <div class="main-content-wrapper">
                {@render children()}
            </div>
            <div class="header-display-mobile">
                <Sidebar bind:open />
            </div>
        </main>
    </div>
    <Footer />
</body>

<style lang="scss">
    .main-content-wrapper {
        max-width: 45rem;
        margin: 0 auto;
        padding: 1rem;
    }

    .header-display-desktop {
        display: flex;
    }

    .header-display-mobile {
        display: none;
    }

    @media only screen and (pointer: coarse) and (max-width: 1024px),
        screen and (max-width: 799px) {
        .header-display-desktop {
            display: none;
        }

        .header-display-mobile {
            display: flex;
        }
    }
</style>
