<script>
    import { page } from "$app/state";
</script>

<h1>{page.status} :(</h1>
{#if page.error}
    <p>
        {page.error.message}
    </p>
{:else}
    <p>An error has occured!</p>
{/if}
