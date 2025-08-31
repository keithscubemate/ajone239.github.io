<script lang="ts">
    import { onMount } from "svelte";
    import sun from "$lib/assets/sun.svg";
    import moon from "$lib/assets/moon.svg";

    import { currentTheme, THEMES } from "./ThemeToggle.svelte.js";

    const STORAGE_KEY = "ajfm-theme";
    const DARK_PREFERENCE = "(prefers-color-scheme: dark)";

    const prefersDarkThemes = () => window.matchMedia(DARK_PREFERENCE).matches;

    onMount(() => {
        applyTheme();
        window
            .matchMedia(DARK_PREFERENCE)
            .addEventListener("change", applyTheme);
    });

    const toggleTheme = () => {
        const stored = localStorage.getItem(STORAGE_KEY);

        if (stored) {
            localStorage.removeItem(STORAGE_KEY);
        } else {
            localStorage.setItem(
                STORAGE_KEY,
                prefersDarkThemes() ? THEMES.LIGHT : THEMES.DARK,
            );
        }

        applyTheme();
    };

    const applyTheme = () => {
        const preferredTheme = prefersDarkThemes() ? THEMES.DARK : THEMES.LIGHT;
        currentTheme.theme =
            localStorage.getItem(STORAGE_KEY) ?? preferredTheme;

        currentTheme.theme =
            localStorage.getItem(STORAGE_KEY) ?? preferredTheme;

        if (currentTheme.theme == THEMES.DARK) {
            document.body.classList.remove(THEMES.LIGHT);
            document.body.classList.add(THEMES.DARK);
        } else {
            document.body.classList.remove(THEMES.DARK);
            document.body.classList.add(THEMES.LIGHT);
        }
    };
</script>

<button onclick={toggleTheme}>
    {#if currentTheme.theme == THEMES.DARK}
        <img alt="dark" src={moon} />
    {:else}
        <img alt="light" src={sun} />
    {/if}
</button>

<style lang="scss">
    button,
    img {
        all: unset;
        background: var(--bg-color);
        width: 25px;
        height: auto;
    }
</style>
