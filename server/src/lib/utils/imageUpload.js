const ALLOWED_MIME_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);
const MAX_IMAGE_BYTES = 1_500_000; // ~1.5MB decoded, keeps Cloudinary usage predictable

const DATA_URI_REGEX = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/;

/*
True when `value` is already a hosted http(s) image URL rather than a
freshly-picked file. Callers use this to skip the base64 guard and the
Cloudinary re-upload for images that are already hosted somewhere public —
e.g. the two predefined onboarding avatars, or a cover image the frontend
lets a user reuse instead of uploading a new file.
*/
export function isHostedImageUrl(value) {
    if (typeof value !== "string" || !value) return false;
    try {
        const parsed = new URL(value);
        return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
        return false;
    }
}

/*
Guards every Cloudinary upload call: rejects anything that isn't a well-formed
base64 image data URI, isn't an allowed image type, or decodes over the size
cap — before it reaches Cloudinary and costs a transform/storage credit.
Throws an Error with `.status = 400` so callers can surface it as a client
error instead of a generic 500.
*/
export function assertImageOk(dataUri) {
    if (typeof dataUri !== "string" || !dataUri) {
        const err = new Error("Invalid image data");
        err.status = 400;
        throw err;
    }

    const match = DATA_URI_REGEX.exec(dataUri);
    if (!match) {
        const err = new Error("Image must be a base64 data URI");
        err.status = 400;
        throw err;
    }

    const [, mimeType, base64Data] = match;
    if (!ALLOWED_MIME_TYPES.has(mimeType.toLowerCase())) {
        const err = new Error("Unsupported image type. Allowed: png, jpeg, webp, gif");
        err.status = 400;
        throw err;
    }

    const padding = (base64Data.match(/=+$/) || [""])[0].length;
    const approxBytes = base64Data.length * 0.75 - padding;
    if (approxBytes > MAX_IMAGE_BYTES) {
        const err = new Error("Image too large (max 1.5MB)");
        err.status = 400;
        throw err;
    }
}
