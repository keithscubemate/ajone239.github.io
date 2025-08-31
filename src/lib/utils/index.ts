import type { Post } from '$lib/types/Post';
import { type PostEntry } from '$lib/types/PostEntry';

type fetchProto = () => Promise<PostEntry[]>;

interface MarkdownModule {
    metadata: Post;
    default: unknown;
}

export const fetchMarkdownPosts: fetchProto = async () => {
    const allPostFiles = import.meta.glob<MarkdownModule>('/src/lib/blog/*.md');
    const iterablePostFiles = Object.entries(allPostFiles);

    const allPosts = await Promise.all(
        iterablePostFiles.map(async ([path, resolver]) => {
            const { metadata } = await resolver();
            const postPath = path.slice(8, -3);

            return {
                meta: metadata,
                path: postPath
            };
        })
    );

    return allPosts;
};

export const fetchSortedMarkdownPosts: fetchProto = async () => {
    const allPosts = await fetchMarkdownPosts();

    const sortedPosts = allPosts.sort((a: PostEntry, b: PostEntry) => {
        const b_date = b.meta.date ?? "";
        const a_date = a.meta.date ?? "";

        return Date.parse(b_date) - Date.parse(a_date)
    });


    return sortedPosts;
};
