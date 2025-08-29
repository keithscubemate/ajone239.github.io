import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
    const response = await fetch(`/api/latest_post`);
    const post = await response.json();

    return { post };
};
