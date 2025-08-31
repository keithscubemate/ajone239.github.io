<script lang="ts">
    import { SiteTitle } from "$lib/info";
    import type { MenuLink } from "$lib/types/MenuLink";
    import { slide } from "svelte/transition";
    import Hamburger from "./Hamburger.svelte";
    import ThemeToggle from "./ThemeToggle.svelte";

    let { menuLinks }: { menuLinks: MenuLink[] } = $props();

    let open = $state(false);
</script>

<div class="header-container">
    <div class="header-content">
        <h3>
            <a href="/" onclick={() => (open = false)}>{SiteTitle}</a>
        </h3>

        <div class="toggle-container">
            <div class="theme-toggle">
                <ThemeToggle />
            </div>
            <button class="nav-toggle" onclick={() => (open = !open)}>
                <Hamburger {open} />
            </button>
        </div>
    </div>

    <!-- TODO: is this good for accessibility? -->
    {#if open}
        <div class="menu" transition:slide>
            <aside>
                <nav>
                    <ul>
                        {#each menuLinks as menuLink (menuLink.title)}
                            <li>
                                <a
                                    class="nav-links"
                                    href={menuLink.url}
                                    onclick={() => (open = false)}
                                >
                                    {menuLink.title}
                                </a>
                            </li>
                        {:else}
                            <li>
                                <p>There's no links :(</p>
                            </li>
                        {/each}
                    </ul>
                </nav>
            </aside>
        </div>
    {/if}
</div>

<style lang="scss">
    .header-container {
        flex-direction: column;
        flex: 1;
        align-items: center;
        border-bottom: 2px solid lightgrey;
    }

    .header-content {
        padding: 0.5rem;
        display: flex;
        flex: 1;
        align-items: center;
        justify-content: space-between;
    }

    .toggle-container {
        display: flex;
        flex: 1;
        align-items: center;
        justify-content: flex-end;
    }

    .nav-toggle {
        all: unset;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;

        &:focus {
            outline: 2px solid #007bff;
            outline-offset: 2px;
        }
    }

    .theme-toggle {
        margin-right: 5px;
        padding-right: 10px;
        border-right: solid 2px var(--main-border-color);
    }

    h3 {
        margin: 10px;
    }

    a {
        color: inherit;
        &.nav-links {
            &::before {
                content: "[  ";
            }
            &::after {
                content: "  ]";
            }
            text-decoration: underline;
            font-weight: bold;
        }
    }

    aside {
        border-top: dashed var(--main-border-color) 2px;
        padding: 5px;
        display: flex;
        justify-content: center;
    }

    ul {
        list-style: none;
        display: contents;
        border: solid red 1px;
    }

    li {
        margin-bottom: 10px;
        text-align: center;
    }
</style>
