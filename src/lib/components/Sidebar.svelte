<script>
    let { open = $bindable(false) } = $props();

    let buttonText = $derived(open ? "close" : "open");
</script>

<aside class:open>
    <button onclick={() => (open = !open)}>
        {buttonText}
    </button>
    <nav>
        <ul>
            <li>
                <a href="/blog">Blog</a>
            </li>
            <li>
                <a href="/arcade">Arcade</a>
            </li>
            <li>
                <a href="/about">About</a>
            </li>
        </ul>
    </nav>
</aside>

<style>
    aside {
        border: solid red 1px;
        left: -100%;
        transition: left 0.3s ease-in-out;
    }

    .open {
        left: 0;
    }

    nav {
        margin: 10px;
    }

    ul {
        margin: 0;
        gap: 1rem;
    }
    a {
        color: inherit;
    }
</style>
