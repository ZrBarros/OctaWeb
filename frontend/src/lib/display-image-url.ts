/** Show API uploads through the site's origin, including URLs already stored in the database. */
export function displayImageUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const apiOrigin = new URL(process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333/api/v1").origin;
    if (parsed.origin === apiOrigin && /^\/uploads\/[^/]+$/.test(parsed.pathname)) {
      return `${parsed.pathname}${parsed.search}`;
    }
  } catch {
    // Relative paths and data URLs already work as supplied.
  }
  return url;
}
