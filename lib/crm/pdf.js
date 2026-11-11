import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { readFile } from "node:fs/promises";
import { money } from "./domain.js";
export async function signedPdf(snapshot, signature, proof) {
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  const fontBytes = await readFile(
    new URL("./fonts/DejaVuSans.ttf", import.meta.url),
  );
  const font = await pdf.embedFont(fontBytes, { subset: true });
  const bold = font;
  let page, y;
  function fresh() {
    page = pdf.addPage([612, 792]);
    y = 744;
  }
  fresh();
  function line(value, heading = false) {
    const safe = String(value).replace(/\t/g, "    ");
    for (const paragraph of safe.split("\n")) {
      let row = "";
      for (const word of paragraph.split(" ").flatMap((w) => {
        const parts = [];
        let part = "";
        for (const char of w) {
          if (font.widthOfTextAtSize(part + char, 10) > 500) {
            parts.push(part);
            part = char;
          } else part += char;
        }
        parts.push(part);
        return parts;
      })) {
        if (
          font.widthOfTextAtSize((row + " " + word).trim(), 10) > 510 &&
          row
        ) {
          draw(row, heading);
          row = word;
        } else row = (row + " " + word).trim();
      }
      draw(row, heading);
    }
  }
  function draw(s, heading) {
    if (y < 60) fresh();
    page.drawText(s, {
      x: 50,
      y,
      size: heading ? 13 : 10,
      font: heading ? bold : font,
      color: rgb(0.1, 0.12, 0.22),
    });
    y -= heading ? 23 : 15;
  }
  line("COLONNA MEDIA LLC", true);
  line(snapshot.title, true);
  line(`Agreement ${proof.id} | ${snapshot.agreement_date}`);
  line(
    `Client: ${snapshot.client.name} | ${snapshot.client.business} | ${snapshot.client.email}`,
  );
  line(`Services: ${snapshot.services.join(", ")}`);
  line(`One-time project total: ${money(snapshot.total_cents)}`);
  for (const p of snapshot.payments)
    line(`${p.label}: ${money(p.amount_cents)} | ${p.due}`);
  if (snapshot.job.mode === "recurring")
    line(
      `Recurring fee: ${money(snapshot.job.monthly_cents)} per month. Billing and cancellation terms below.`,
    );
  line("");
  line(snapshot.terms);
  fresh();
  line("Electronic signature and acceptance record", true);
  const image = await pdf.embedPng(signature);
  const scale = Math.min(300 / image.width, 95 / image.height);
  page.drawImage(image, {
    x: 50,
    y: y - 95,
    width: image.width * scale,
    height: image.height * scale,
  });
  y -= 115;
  line(`Signed by: ${proof.name}`);
  line(`Intended recipient: ${snapshot.client.email}`);
  line(`Accepted at (UTC): ${proof.at}`);
  line(`Agreement SHA-256: ${proof.hash}`);
  line(`IP address: ${proof.ip || "Unavailable"}`);
  line(`Browser: ${proof.user_agent}`);
  line(
    "Electronic consent: accepted. Identity method: private signing link (not independent identity verification).",
  );
  pdf.setTitle(snapshot.title);
  pdf.setAuthor("Colonna Media LLC");
  pdf.setCreationDate(new Date(proof.at));
  pdf
    .getPages()
    .forEach((p, i) =>
      p.drawText(
        `Colonna Media LLC | ${proof.id} | ${i + 1} / ${pdf.getPageCount()}`,
        { x: 50, y: 30, size: 7, font, color: rgb(0.5, 0.53, 0.6) },
      ),
    );
  return Buffer.from(await pdf.save());
}
