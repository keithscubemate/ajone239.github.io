<script lang="ts">
    import BlogPostCard from "$lib/components/BlogPostCard.svelte";
    import type { PostEntry } from "$lib/types/PostEntry";
    import type { PageProps } from "./$types";

    let { data }: PageProps = $props();
    let { posts }: { posts: PostEntry[] } = data;

    let searchText = $state("");

    let matchingPosts: PostEntry[] = $derived.by(() => {
        if (!searchText) {
            return posts;
        }

        return posts.filter(
            (post) =>
                post.meta.title
                    ?.toLowerCase()
                    .includes(searchText.toLowerCase()) ||
                post.meta.excerpt
                    ?.toLowerCase()
                    .includes(searchText.toLowerCase()) ||
                post.meta.date
                    ?.toLowerCase()
                    .includes(searchText.toLowerCase()) ||
                post.path?.toLowerCase().includes(searchText.toLowerCase()),
        );
    });
</script>

<svelte:head>
    <title>Austin's Blog</title>
</svelte:head>

<h1>Posts</h1>

<input type="text" placeholder="Search for a post..." bind:value={searchText} />

<ul>
    {#each matchingPosts as entry (entry.path)}
        <li>
            <BlogPostCard {entry} />
        </li>
    {:else}
        <li>
            <p>There are no posts that match your search :(.</p>
        </li>
    {/each}
</ul>

<style>
    input {
        flex: 1;
        width: 95%;
        padding: 10px;
        border: none;
        color: var(--text-color);
        border: 2px solid var(--main-border-color);
        border-radius: 5px;
        font-size: 1rem;
        background-color: transparent;
        outline: none;

        &::placeholder {
            color: var(--place-holder-text-color);
        }

        &:focus,
        &:hover {
            border-color: var(--border-hover-color);
            box-shadow: 0 2px 0 1px var(--border-hover-color);
        }
    }
    ul {
        display: contents;
    }
    li {
        list-style-type: none;
    }
</style>
