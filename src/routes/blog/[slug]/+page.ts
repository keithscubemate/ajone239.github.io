import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
    const path = `/blog/${params.slug}`;
    const post = await import(`$lib/blog/${params.slug}.md`);
    const { title, date, excerpt } = post.metadata;
    const Content = post.default;

    return {
        Content,
        title,
        excerpt,
        path,
        date
    };
};

