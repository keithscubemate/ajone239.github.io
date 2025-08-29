<script lang="ts">
    import { SiteTitle } from "$lib/info";
    import type { MenuLink } from "$lib/types/MenuLink";

    let { menuLinks }: { menuLinks: MenuLink[] } = $props();
</script>

<div>
    <h3>
        <a href="/">{SiteTitle}</a>
    </h3>

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
</div>

<style>
    div {
        padding: 0.5rem;
        display: flex;
        flex: 1;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        border-bottom: 2px solid lightgrey;
    }

    h3,
    nav {
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
