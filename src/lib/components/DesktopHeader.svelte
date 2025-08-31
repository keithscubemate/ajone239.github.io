<script lang="ts">
    import { SiteTitle } from "$lib/info";
    import type { MenuLink } from "$lib/types/MenuLink";
    import ThemeToggle from "./ThemeToggle.svelte";

    let { menuLinks }: { menuLinks: MenuLink[] } = $props();
</script>

<div class="header-container">
    <h3>
        <a href="/">{SiteTitle}</a>
    </h3>

    <div class="menu-container">
        <nav>
            <ul>
                {#each menuLinks as menuLink (menuLink.title)}
                    <li>
                        <a href={menuLink.url}>{menuLink.title}</a>
                    </li>
                {:else}
                    <li>
                        <p>There's no links :(</p>
                    </li>
                {/each}
            </ul>
        </nav>
        <ThemeToggle />
    </div>
</div>

<style>
    .header-container {
        padding: 0.5rem;
        display: flex;
        flex: 1;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        border-bottom: 2px solid lightgrey;
    }

    .menu-container {
        display: flex;
        flex: 1;
        justify-content: flex-end;
    }

    nav {
        margin: 5px;
        margin-right: 10px;
        padding: 5px;
        padding-right: 10px;
        border-right: solid 2px var(--main-border-color);
    }

    h3 {
        margin: 10px;
    }

    ul {
        list-style-type: none;
        display: flex;
        margin: 0;
        gap: 1rem;
    }
    a {
        color: inherit;
    }
</style>
