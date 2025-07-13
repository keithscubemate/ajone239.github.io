<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import '$lib/styles/styles.scss';
	import '$lib/styles/prism-styles.css';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<body>
	<div class="site-wrapper">
		<Header />

		<main>
			<div class="main-content-wrapper">
				{@render children()}
			</div>
		</main>

		<Footer />
	</div>
</body>

<style lang="scss">
	.main-content-wrapper {
		max-width: 40rem;
		margin: 0 auto;
		padding: 1rem;
	}
</style>
