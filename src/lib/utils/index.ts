import { type PostEntry } from '$lib/types/PostEntry';

type fetchProto = () => Promise<PostEntry[]>;

export const fetchMarkdownPosts: fetchProto = async () => {
    const allPostFiles = import.meta.glob('/src/lib/blog/*.md');
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
