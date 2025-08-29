<script lang="ts">
    import BlogPostCard from "$lib/components/BlogPostCard.svelte";
    import type { PostEntry } from "$lib/types/PostEntry";
    import type { PageProps } from "./$types";

    let { data }: PageProps = $props();
    let { posts }: { posts: PostEntry[] } = data;
</script>

<svelte:head>
    <title>Austin's Blog</title>
</svelte:head>

<h1>Posts</h1>

<ul>
    {#each posts as entry (entry.path)}
        <li>
            <BlogPostCard {entry} />
        </li>
    {/each}
</ul>

<style>
    ul {
        display: contents;
    }

    li {
        list-style-type: none;
    }
</style>
