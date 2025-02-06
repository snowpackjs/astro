export const GET = () => {
  return new Response(
    undefined,
    {
      status: 301,
      headers: {
        Location: 'https://example.com',
      }
    }
  );
};
