/** Show API uploads through the site's origin, including URLs already stored in the database. */
export function displayImageUrl(url: string): string {
  try {
    const parsed = new URL(url);
    if (["http:", "https:"].includes(parsed.protocol) && /^\/uploads\/[^/]+$/.test(parsed.pathname)) {
      return `${parsed.pathname}${parsed.search}`;
    }
  } catch {
    // Relative paths and data URLs already work as supplied.
  }
  return url;
}
