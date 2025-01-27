export async function GET(context) {
	return context.rewrite('/to-endpoint');
}
