<script>
    import { SiteTitle } from "$lib/info";

    let { open = $bindable(false) } = $props();

    let buttonText = $derived(open ? "close" : "open");
</script>

<div>
    <h3>
        <a href="/">{SiteTitle}</a>
    </h3>

    <button onclick={() => (open = !open)}>
        {buttonText}
    </button>
</div>

<style>
    div {
        padding: 0.5rem;
        display: flex;
        flex-wrap: wrap;
        flex: 1;
        align-items: center;
        justify-content: space-between;
        border-bottom: 2px solid lightgrey;
    }

    h3 {
        margin: 10px;
    }
    a {
        color: inherit;
    }
</style>
