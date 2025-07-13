<script>
	import { SiteTitle } from '$lib/info';
</script>

<header>
	<h3>
		<a href="/">{SiteTitle}</a>
	</h3>

	<nav>
		<ul>
			<li>
				<a href="/blog">Blog</a>
			</li>
			<li>
				<a href="/arcade">Arcade</a>
			</li>
			<li>
				<a href="/about">About</a>
			</li>
		</ul>
	</nav>
</header>

<style>
	header {
		padding: 0.5rem;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		border-bottom: 2px solid lightgrey;
	}

	h3,
	nav {
		margin: 10px;
	}

	ul {
		margin: 0;
		list-style-type: none;
		display: flex;
		gap: 1rem;
	}
	a {
		color: inherit;
	}
</style>
