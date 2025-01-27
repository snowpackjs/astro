import { db, AstrojsWebVitals_Metric } from "astro:db";

export const prerender = false;

export async function GET() {
	const rows = await db.select().from(AstrojsWebVitals_Metric).all();
	return new Response(JSON.stringify(rows));
}
