<script lang="ts">
    import BlogPostCard from "$lib/components/BlogPostCard.svelte";
    import { SiteTitle } from "$lib/info";
    import type { PostEntry } from "$lib/types/PostEntry";
    import type { PageProps } from "./$types";

    let { data }: PageProps = $props();
    let { post }: { post: PostEntry } = data;
</script>

<svelte:head>
    <title>{SiteTitle}</title>
</svelte:head>

<h1>Welcome to the Journey</h1>

<!-- prettier-ignore -->
<p>
    Hey, I'm Austin -- the one having the journey.
    This blog is the storehouse for my digital goods, thoughts, and whatever else lands here.
</p>

<!-- prettier-ignore -->
<p>
    I've made a few small web games -- mostly exposure therapy for publishing code.
    Some games I'm proud of; some of the games... also exist.
    You can play them in the <a href="/arcade">arcade</a>.
</p>

<!-- prettier-ignore -->
<p>
    In the <a href="/blog">blog</a> proper, you'll find a collection of other thoughts and musings.
    Read my latest post below.
</p>

<!-- prettier-ignore -->
<p>
    Like most personal websites, this doubles as a living resume.
    Find my work and experience <a href="/about">here</a>.
</p>

<h2>The latest blog post:</h2>

<BlogPostCard entry={post} />
