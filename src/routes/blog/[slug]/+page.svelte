<script lang="ts">
	import BlogPostCard from '$lib/components/BlogPostCard.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let { title, date, path, excerpt, Content } = data;
</script>

<svelte:head>
	<title>Austin's Journey for Meaning - {title}</title>
	<meta property="og:title" content={title} />
</svelte:head>

<article>
	<BlogPostCard
		entry={{
			path,
			meta: {
				title,
				date,
				excerpt,
				Content
			}
		}}
		hover={false}
	/>

	<Content />
</article>
