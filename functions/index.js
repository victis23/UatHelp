const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

const RATE_LIMIT = 3;
const RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour

exports.submitLead = functions.https.onRequest(async (req, res) => {
    res.set("Access-Control-Allow-Origin", "https://uathelp.com");
    res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        return res.status(204).send("");
    }

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const ip = (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || req.ip || "unknown";
    const ipKey = ip.replace(/[^a-zA-Z0-9]/g, "_");

    const db = admin.firestore();
    const rateLimitRef = db.collection("rateLimit").doc(ipKey);
    const now = Date.now();

    try {
        const limited = await db.runTransaction(async (t) => {
            const doc = await t.get(rateLimitRef);
            const data = doc.exists ? doc.data() : { count: 0, windowStart: now };

            if (now - data.windowStart > RATE_WINDOW_MS) {
                data.count = 0;
                data.windowStart = now;
            }

            if (data.count >= RATE_LIMIT) {
                return true;
            }

            t.set(rateLimitRef, { count: data.count + 1, windowStart: data.windowStart });
            return false;
        });

        if (limited) {
            return res.status(429).json({ error: "Too many submissions. Please try again later." });
        }
    } catch (err) {
        console.error("Rate limit check failed:", err);
        // Allow submission through if rate limit check itself errors
    }

    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ error: "All fields are required." });
    }

    if (typeof name !== "string" || typeof email !== "string" || typeof message !== "string") {
        return res.status(400).json({ error: "Invalid input." });
    }

    if (name.length > 200 || email.length > 320 || message.length > 5000) {
        return res.status(400).json({ error: "Input exceeds maximum length." });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: "Invalid email address." });
    }

    await db.collection("leads").add({
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
        createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return res.status(200).json({ success: true });
});

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
