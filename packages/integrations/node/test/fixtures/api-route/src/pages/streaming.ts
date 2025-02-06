export const GET = ({ locals }) => {
    let sentChunks = 0;

    const readableStream = new ReadableStream({
        async pull(controller) {
            if (sentChunks === 3) return controller.close();
            else sentChunks++;

            await new Promise(resolve => setTimeout(resolve, 1000));
            controller.enqueue(new TextEncoder().encode('hello\n'));
        },
        cancel() {
            locals.cancelledByTheServer = true;
        }
    });

    return new Response(readableStream, {
        headers: {
            "Content-Type": "text/event-stream"
        }
    });
}
