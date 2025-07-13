<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let { title, Content } = data;
</script>

<svelte:head>
	<title>Austin's Journey for Meaning - {title}</title>
	<meta property="og:title" content={title} />
</svelte:head>

<article>
	<h1>{title}</h1>

	<Content />
</article>
