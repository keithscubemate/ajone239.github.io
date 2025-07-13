<script lang="ts">
	import BlogPostCard from '$lib/components/BlogPostCard.svelte';
	import { SiteTitle } from '$lib/info';
	import type { PostEntry } from '$lib/types/PostEntry';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { posts }: { posts: PostEntry[] } = data;
</script>

<svelte:head>
	<title>{SiteTitle}</title>
</svelte:head>

<h1>Welcome to the Journey</h1>

<p>
	Be it
	<a href="/arcade">games</a>,
	<a href="/blog">writings</a>, or
	<a href="/about">personal info</a>
	this is where I put my digital goods. I hope you enjoy it.
</p>

<h2>Recent Posts from my <a href="/blog">Blog</a></h2>

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
