export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (request.method !== "POST") return new Response("pebble-grok-bridge ok");
    if (!url.pathname.startsWith("/automations/webhook/")) return new Response("not found", { status: 404 });
    const auth = request.headers.get("Authorization");
    if (!auth) return new Response("missing Authorization", { status: 401 });
    const ct = request.headers.get("content-type") || "";
    let raw = {}; let text = "";
    try {
      if (ct.includes("json")) { raw = await request.json(); }
      else if (ct.includes("form")) {
        const form = await request.formData();
        for (const [k, v] of form.entries()) raw[k] = typeof v === "string" ? v : "[file: " + (v.name || k) + "]";
      } else { raw = { body: await request.text() }; }
      text = raw.transcription || raw.text || raw.transcript || raw.body || "";
    } catch (e) { text = "(読み取り失敗) " + e.message; }
    const payload = {
      source: "pebble", text, test: raw.test === "true" || request.headers.get("X-Index-Trigger") === "test-event",
      trigger: request.headers.get("X-Index-Trigger"), delivery: request.headers.get("X-Index-Delivery"),
      recordedAt: raw.recordedAt ? new Date(Number(raw.recordedAt)).toISOString() : null,
      receivedAt: new Date().toISOString(), raw
    };
    const res = await fetch("https://api2.cursor.sh" + url.pathname, {
      method: "POST", headers: { "Content-Type": "application/json", "Authorization": auth }, body: JSON.stringify(payload)
    });
    return new Response(await res.text(), { status: res.status });
  }
};
