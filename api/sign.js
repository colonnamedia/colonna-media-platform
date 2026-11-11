import { randomUUID, createHash } from "node:crypto";
import {
  db,
  check,
  body,
  assertOrigin,
  headers,
  fail,
  tokenFrom,
  hashToken,
  audit,
} from "../lib/crm/server.js";
import { signSchema } from "../lib/crm/domain.js";
import { signedPdf } from "../lib/crm/pdf.js";
export default async function handler(req, res) {
  headers(res);
  try {
    if (!["GET", "POST"].includes(req.method))
      return res.status(405).json({ error: "Method not allowed" });
    assertOrigin(req);
    const client = db();
    const token = tokenFrom(req);
    const { data: a, error } = await client
      .from("crm_agreements")
      .select("id,snapshot,status,expires_at,snapshot_hash")
      .eq("token_hash", hashToken(token))
      .single();
    if (
      error ||
      !a ||
      a.status !== "issued" ||
      new Date(a.expires_at) <= new Date()
    )
      throw Object.assign(
        new Error("Signing link is invalid, completed, revoked, or expired"),
        { status: 404 },
      );
    if (req.method === "GET") {
      await audit(client, "agreement", a.id, "opened", "private-link");
      return res.status(200).json({ id: a.id, snapshot: a.snapshot });
    }
    const input = signSchema.parse(body(req));
    const png = Buffer.from(input.signature.split(",")[1], "base64");
    if (
      png.length < 100 ||
      png.readUInt32BE(0) !== 0x89504e47 ||
      png.readUInt32BE(16) > 2000 ||
      png.readUInt32BE(20) > 1000
    )
      throw Object.assign(new Error("Please draw your signature"), {
        status: 400,
      });
    const proof = {
      id: a.id,
      name: input.name,
      at: new Date().toISOString(),
      hash: a.snapshot_hash,
      ip: String(
        req.headers["x-vercel-forwarded-for"] ||
          req.headers["x-forwarded-for"] ||
          "",
      )
        .split(",")[0]
        .slice(0, 100),
      user_agent: String(req.headers["user-agent"] || "").slice(0, 500),
    };
    let file;
    try {
      file = await signedPdf(a.snapshot, input.signature, proof);
    } catch {
      throw Object.assign(new Error("Signature image could not be read"), {
        status: 400,
      });
    }
    proof.pdf_sha256 = createHash("sha256").update(file).digest("hex");
    const path = `${a.id}/${randomUUID()}.pdf`;
    const upload = await client.storage
      .from("crm-agreements")
      .upload(path, file, { contentType: "application/pdf", upsert: false });
    if (upload.error) throw Error("Unable to preserve signed record");
    const finalized = await client.rpc("crm_finalize_signature", {
      agreement_id: a.id,
      signing_token_hash: hashToken(token),
      signer_name: input.name,
      signature_png: input.signature,
      proof,
      pdf: path,
    });
    if (finalized.error) {
      await client.storage.from("crm-agreements").remove([path]);
      throw Object.assign(
        new Error(
          "This agreement is no longer available to sign. Reload to check its status.",
        ),
        { status: 409 },
      );
    }
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="signed-agreement-${a.id}.pdf"`,
    );
    return res.status(200).send(file);
  } catch (e) {
    return fail(res, e);
  }
}
