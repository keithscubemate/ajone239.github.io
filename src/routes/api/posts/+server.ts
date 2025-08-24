import type { RequestHandler } from './$types';
import { type PostEntry } from '$lib/types/PostEntry';
import { fetchMarkdownPosts } from '$lib/utils';
import { json } from '@sveltejs/kit';


export const GET: RequestHandler = async () => {
    const all_posts = await fetchMarkdownPosts();

    const sorted_posts = all_posts.sort((a: PostEntry, b: PostEntry) => {
        const b_date = b.meta.date ?? "";
        const a_date = a.meta.date ?? "";

        return Date.parse(b_date) - Date.parse(a_date)
    });

    return json(sorted_posts);
}
