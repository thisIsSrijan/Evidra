import crypto from "crypto";

/**
 * Standard provenance hashing for Evidra assets.
 * Fingerprints Cloudinary public_id + version + timestamp using SHA-256.
 */
export function computeCanonicalProvenanceHash(
  publicId: string,
  version: string,
  timestamp: string | Date
): string {
  const ts =
    timestamp instanceof Date ? timestamp.toISOString() : String(timestamp);
  return crypto
    .createHash("sha256")
    .update(`${publicId}:${version}:${ts}`)
    .digest("hex");
}

export interface VerificationResult {
  isVerified: boolean;
  tamperDetected: boolean;
  calculatedHash: string;
  storedHash?: string;
  algorithm: string;
  verifiedAt: string;
  matchedFormat?: string;
}

/**
 * Cryptographically re-verifies an asset's stored provenance hash against its immutable attributes.
 */
export function verifyAssetProvenance(asset: {
  cloudinaryPublicId: string;
  cloudinaryVersion: string;
  createdAt: Date | string;
  provenanceHash?: string;
}): VerificationResult {
  const verifiedAt = new Date().toISOString();
  const algorithm = "SHA-256";

  if (!asset.provenanceHash || typeof asset.provenanceHash !== "string") {
    return {
      isVerified: false,
      tamperDetected: true,
      calculatedHash: "",
      storedHash: undefined,
      algorithm,
      verifiedAt,
    };
  }

  const publicId = asset.cloudinaryPublicId;
  const version = asset.cloudinaryVersion;
  const dateObj = new Date(asset.createdAt);
  const iso = dateObj.toISOString();
  const dateOnly = iso.split("T")[0]; // YYYY-MM-DD
  const rawStr = String(asset.createdAt);

  // Candidate canonical formats used during ingestion/seeding
  const candidates: Array<{ format: string; hash: string }> = [
    {
      format: "canonical_colon_iso",
      hash: crypto.createHash("sha256").update(`${publicId}:${version}:${iso}`).digest("hex"),
    },
    {
      format: "canonical_colon_date",
      hash: crypto.createHash("sha256").update(`${publicId}:${version}:${dateOnly}`).digest("hex"),
    },
    {
      format: "compact_date",
      hash: crypto.createHash("sha256").update(`${publicId}${version}${dateOnly}`).digest("hex"),
    },
    {
      format: "compact_iso",
      hash: crypto.createHash("sha256").update(`${publicId}${version}${iso}`).digest("hex"),
    },
    {
      format: "raw_string",
      hash: crypto.createHash("sha256").update(`${publicId}:${version}:${rawStr}`).digest("hex"),
    },
  ];

  const match = candidates.find(
    (c) => c.hash.toLowerCase() === asset.provenanceHash?.toLowerCase()
  );

  if (match) {
    return {
      isVerified: true,
      tamperDetected: false,
      calculatedHash: match.hash,
      storedHash: asset.provenanceHash,
      algorithm,
      verifiedAt,
      matchedFormat: match.format,
    };
  }

  // Not matching any valid canonical ingestion hash -> Tamper detected
  const standardCalculated = candidates[0].hash;
  return {
    isVerified: false,
    tamperDetected: true,
    calculatedHash: standardCalculated,
    storedHash: asset.provenanceHash,
    algorithm,
    verifiedAt,
  };
}
