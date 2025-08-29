<script lang="ts">
    import Footer from "$lib/components/Footer.svelte";
    import "$lib/styles/styles.scss";
    import "$lib/styles/prism-styles.css";
    import type { LayoutProps } from "./$types";
    import MobileHeader from "$lib/components/MobileHeader.svelte";
    import DesktopHeader from "$lib/components/DesktopHeader.svelte";

    let { children }: LayoutProps = $props();

    const menuLinks = [
        { title: "Blog", url: "/blog" },
        { title: "Arcade", url: "/arcade" },
        { title: "About", url: "/about" },
    ];
</script>

<div class="site-wrapper">
    <div class="header-display-desktop">
        <DesktopHeader {menuLinks} />
    </div>

    <div class="header-display-mobile">
        <MobileHeader {menuLinks} />
    </div>

    <div class="main-content-wrapper">
        {@render children()}
    </div>

    <Footer />
</div>

<style lang="scss">
    .main-content-wrapper {
        flex: 1;
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
