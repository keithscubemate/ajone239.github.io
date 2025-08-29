import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
    const response = await fetch(`/api/posts/latest`);
    const post = await response.json();

    return { post };
};
