export async function GET({ request }) {
  return fetch("https://httpstat.us/500", request)
}
