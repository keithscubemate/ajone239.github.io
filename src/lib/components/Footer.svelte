<script>
	import { SiteDescription, SiteTitle } from '$lib/info';
</script>

<footer>
	<span>
		<p>{SiteTitle}</p>
		<p class="chill">
			<a href="mailto:ajones53.aj@gmail.com">ajones53.aj@gmail.com</a>
		</p>
	</span>

	<span>
		<p>
			<a href="https://github.com/ajone239">My Github</a>
		</p>
		<p class="chill">{SiteDescription}</p>
	</span>
</footer>

<style>
	footer {
		padding: 1rem;
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		border-top: 2px dashed lightgrey;
	}
	p.chill {
		opacity: 0.5;
	}
	a {
		color: inherit;
	}
</style>
