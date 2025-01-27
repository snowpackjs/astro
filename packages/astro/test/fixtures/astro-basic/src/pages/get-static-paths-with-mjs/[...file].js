export function getStaticPaths() {
  return [
    { params: { file: 'example.mjs' } },
    { params: { file: 'example.js' } },
  ];
}

export function GET() {
  return new Response('console.log("fileContent");')
}
