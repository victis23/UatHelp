const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

exports.onNewLead = functions.firestore
    .document("leads/{leadId}")
    .onCreate(async (snap) => {
        const leadData = snap.data();

        const entries = Object.entries(leadData).filter(([key]) => key !== "createdAt");

        const htmlRows = entries
            .map(
                ([key, value]) => `
        <tr>
          <td style="padding:8px 12px;border:1px solid #ddd;font-weight:600;text-transform:capitalize;">
            ${escapeHtml(String(key))}
          </td>
          <td style="padding:8px 12px;border:1px solid #ddd;">
            ${escapeHtml(String(value || "-"))}
          </td>
        </tr>
      `
            )
            .join("");

        const textBody = entries
            .map(([key, value]) => `${key}: ${value || "-"}`)
            .join("\n");

        const htmlBody = `
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#111;">
      <h2>New UAT Help Lead</h2>
      <p>A new form submission was received from uathelp.com.</p>
      <table style="border-collapse:collapse;width:100%;max-width:700px;">
        <tbody>${htmlRows}</tbody>
      </table>
    </div>
  `;

        await admin.firestore().collection("mail").add({
            to: ["helpme@uathelp.com"],
            message: {
                subject: "New UAT Help Lead",
                text: textBody,
                html: htmlBody
            },
            submittedAt: admin.firestore.FieldValue.serverTimestamp(),
            formData: Object.fromEntries(entries)
        });
    });

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}
