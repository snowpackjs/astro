import { products } from '../../models/db';

export function GET() {
	return new Response(JSON.stringify(products));
}
