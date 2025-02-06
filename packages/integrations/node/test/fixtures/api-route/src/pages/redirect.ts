import type { APIContext } from 'astro';

export async function GET({ redirect }: APIContext) {
    return redirect('/destination');
}
