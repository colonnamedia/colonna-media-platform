import { randomUUID } from "node:crypto";
export function decodeLinkImage(input) {
  const { data, mime } = input;
  if (
    typeof data !== "string" ||
    data.length > 2800000 ||
    !/^[a-zA-Z0-9+/]*={0,2}$/.test(data)
  )
    throw Object.assign(
      new Error("Choose a JPEG, PNG, or WebP image under 2 MB."),
      { status: 400 },
    );
  const bytes = Buffer.from(data, "base64");
  const actual = bytes
    .subarray(0, 8)
    .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
    ? "image/png"
    : bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255
      ? "image/jpeg"
      : bytes.subarray(0, 4).toString() === "RIFF" &&
          bytes.subarray(8, 12).toString() === "WEBP"
        ? "image/webp"
        : "";
  if (
    !actual ||
    actual !== mime ||
    bytes.length > 2 * 1024 * 1024 ||
    bytes.length < 16
  )
    throw Object.assign(
      new Error("Choose a valid JPEG, PNG, or WebP image under 2 MB."),
      { status: 400 },
    );
  return {
    bytes,
    mime: actual,
    path: `links/${randomUUID()}.${{ "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp" }[actual]}`,
  };
}
