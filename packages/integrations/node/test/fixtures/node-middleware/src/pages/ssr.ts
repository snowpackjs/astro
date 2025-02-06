export async function GET() {
	let number = Math.random();
	return Response.json({
		number,
		message: `Here's a random number: ${number}`,
	});
}
