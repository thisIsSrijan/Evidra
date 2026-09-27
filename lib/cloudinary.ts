import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };
export default cloudinary;

/**
 * Assembles a dynamic multi-image collage cover or composite montage using Cloudinary Transformations.
 * Supports single-image hero (1200x630), 2-image split comparison (600x630 each), and 3+ panel composite.
 */
export function generateCollageUrl(
  assets: Array<{ cloudinaryPublicId: string; resourceType?: string }>
): string {
  if (!assets || assets.length === 0) {
    return "";
  }

  // 1. Single Asset Hero Banner
  if (assets.length === 1) {
    return cloudinary.url(assets[0].cloudinaryPublicId, {
      width: 1200,
      height: 630,
      crop: "fill",
      gravity: "auto",
      fetch_format: "auto",
      quality: "auto",
      secure: true,
    });
  }

  // 2. Two Assets Side-by-Side Split Collage
  if (assets.length === 2) {
    const primary = assets[0];
    const secondary = assets[1];
    const secondaryOverlayId = secondary.cloudinaryPublicId.replace(/\//g, ":");

    return cloudinary.url(primary.cloudinaryPublicId, {
      transformation: [
        { width: 600, height: 630, crop: "fill", gravity: "auto" },
        {
          overlay: secondaryOverlayId,
          width: 600,
          height: 630,
          crop: "fill",
          gravity: "auto",
        },
        { flags: "layer_apply", gravity: "east" },
      ],
      fetch_format: "auto",
      quality: "auto",
      secure: true,
    });
  }

  // 3. Three or more Assets Composite (Primary on left, stacked panels on right)
  const primary = assets[0];
  const second = assets[1];
  const third = assets[2];
  const secondOverlayId = second.cloudinaryPublicId.replace(/\//g, ":");
  const thirdOverlayId = third.cloudinaryPublicId.replace(/\//g, ":");

  return cloudinary.url(primary.cloudinaryPublicId, {
    transformation: [
      { width: 600, height: 630, crop: "fill", gravity: "auto" },
      {
        overlay: secondOverlayId,
        width: 600,
        height: 315,
        crop: "fill",
        gravity: "auto",
      },
      { flags: "layer_apply", gravity: "north_east" },
      {
        overlay: thirdOverlayId,
        width: 600,
        height: 315,
        crop: "fill",
        gravity: "auto",
      },
      { flags: "layer_apply", gravity: "south_east" },
    ],
    fetch_format: "auto",
    quality: "auto",
    secure: true,
  });
}
