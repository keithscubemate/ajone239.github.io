<script>
    import { SiteDescription, SiteTitle } from "$lib/info";
    import rssLogo from "$lib/assets/rss_logo.png";
</script>

<footer>
    <span>
        <p>{SiteTitle}</p>
        <p class="chill">
            <a href="mailto:ajones53.aj@gmail.com">ajones53.aj@gmail.com</a>
        </p>
    </span>

    <span>
        <a href="/rss.xml">
            <div class="rss-logo-containter">
                <img class="rss-logo" alt="The rss logo" src={rssLogo} />
                <p>RSS Feed</p>
            </div>
        </a>
    </span>

    <span>
        <p>
            <a href="https://github.com/ajone239">My Github</a>
        </p>
        <p class="chill">{SiteDescription}</p>
    </span>
</footer>

<style lang="scss">
    footer {
        padding: 1rem;
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        border-top: 2px dashed lightgrey;

        @media (max-width: 700px) {
            flex-direction: column;
        }
    }
    p.chill {
        opacity: 0.5;
    }
    a {
        color: inherit;
    }
    .rss-logo-containter {
        display: flex;
        flex-direction: row;
        align-items: center;
    }
    .rss-logo {
        all: initial;
        margin-right: 5px;
        height: 25px;
        width: auto;
    }
</style>
