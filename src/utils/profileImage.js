export function normalizeProfileImage(profileImage) {
  if (!profileImage) return "/default_avatar.png";
  if (/^https?:\/\//i.test(profileImage)) return profileImage;
  const backendUrl = process.env.REACT_APP_BACKEND_URL || "";
  return `${backendUrl}${profileImage.startsWith("/") ? profileImage : `/${profileImage}`}`;
}

export function resolveProfileImage(profileImage) {
  return normalizeProfileImage(profileImage);
}
