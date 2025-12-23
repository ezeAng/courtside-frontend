export function isYouTubeLink(url = "") {
  const normalized = url.toLowerCase();
  return normalized.includes("youtube.com") || normalized.includes("youtu.be");
}

export function extractYouTubeId(url = "") {
  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.hostname.includes("youtu.be")) {
      return parsedUrl.pathname.replace("/", "");
    }

    if (parsedUrl.searchParams.has("v")) {
      return parsedUrl.searchParams.get("v");
    }

    const pathParts = parsedUrl.pathname.split("/");
    const watchIndex = pathParts.findIndex((part) => part === "embed" || part === "v");
    if (watchIndex !== -1 && pathParts[watchIndex + 1]) {
      return pathParts[watchIndex + 1];
    }
  } catch (error) {
    return null;
  }

  return null;
}
