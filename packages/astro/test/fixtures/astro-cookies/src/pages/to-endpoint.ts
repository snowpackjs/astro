export async function GET(context) {
	context.cookies.set('test', 'value');
	return Response.json({hi: "world"})
}
