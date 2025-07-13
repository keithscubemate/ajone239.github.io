import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
    const post = await import(`$lib/blog/advent_of_code_2024/${params.slug}.md`);
    const { title } = post.metadata;
    const Content = post.default;

    return {
        Content,
        title,
    };
};


