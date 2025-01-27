export async function GET() {
    return new Response("Text from pages/not-ok.ts", {
        status: 404,
    });
}
