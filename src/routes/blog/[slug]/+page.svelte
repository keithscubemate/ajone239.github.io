<script lang="ts">
    import BlogPostCard from "$lib/components/BlogPostCard.svelte";
    import { SiteUrl } from "$lib/info";
    import type { PageProps } from "./$types";

    let { data }: PageProps = $props();

    let { title, date, path, excerpt, Content } = data;
</script>

<svelte:head>
    <title>Austin's Journey for Meaning - {title}</title>
    <meta name="description" content={excerpt} />

    <meta property="og:title" content={title} />
    <meta property="og:description" content={excerpt} />
    <meta property="og:type" content="article" />
    <meta property="og:url" content={`${SiteUrl}${path}`} />

    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content={title} />
    <meta name="twitter:description" content={excerpt} />
</svelte:head>

<article>
    <BlogPostCard
        entry={{
            path,
            meta: {
                title,
                date,
                excerpt,
                Content,
            },
        }}
        hover={false}
    />

    <Content />
</article>
