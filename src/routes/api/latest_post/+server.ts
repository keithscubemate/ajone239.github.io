import type { RequestHandler } from './$types';
import { fetchSortedMarkdownPosts } from '$lib/utils';
import { json } from '@sveltejs/kit';


export const GET: RequestHandler = async () => {
    const sorted_posts = await fetchSortedMarkdownPosts()
    return json(sorted_posts[0]);
}
