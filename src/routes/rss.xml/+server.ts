import type { PostEntry } from '$lib/types/PostEntry';
import { fetchMarkdownPosts } from '$lib/utils';
import { SiteUrl, SiteTitle, SiteDescription } from '$lib/info';

export const prerender = true;

export const GET = async () => {
    const compartPostDates = (a: PostEntry, b: PostEntry) =>
        Date.parse(b.meta.date ?? "") - Date.parse(a.meta.date ?? "");
    const allPosts = await fetchMarkdownPosts();
    const sortedPosts = allPosts.sort(compartPostDates);

    const body = render(sortedPosts);
    const options = {
        headers: {
            'Cache-Control': 'max-age=0, s-maxage=3600',
            'Content-Type': 'application/xml'
        }
    };

    return new Response(body, options);
};

const render = (posts: PostEntry[]): string =>
    `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
    <channel>
        <title>${SiteTitle}</title>
        <description>${SiteDescription}</description>
        <link>${SiteUrl}</link>
        <atom:link href="${SiteUrl}/rss.xml" rel="self" type="application/rss+xml"/>
        ${posts.map((post) => render_post(post)).join('')}
    </channel>
</rss>`;

const render_post = (post: PostEntry): string => {
    const path = SiteUrl + post.path;
    const title = post.meta.title ?? path;
    const description = post.meta.excerpt ?? title;
    const date = new Date(post.meta.date ?? 0).toUTCString();

    return `<item>
        <guid isPermaLink="true"> ${path} </guid>
        <title> ${title} </title>
        <link> ${path} </link>
        <description> ${description} </description>
        <pubDate>${date} </pubDate>
    </item>`
}
