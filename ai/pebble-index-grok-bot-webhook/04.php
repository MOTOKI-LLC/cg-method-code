async function verifyIndexSignature(request, rawBody, secret) {
  const h = (name) => request.headers.get(name) || "";
  const version = h("X-Index-Webhook-Version");
  const timestamp = h("X-Index-Timestamp");
  const signature = h("X-Index-Signature");
  if (version !== "1" || !/^\d+$/.test(timestamp)) return false;
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false;
  if (!/^[0-9a-f]{64}$/.test(signature)) return false;
  const isTest = h("X-Index-Test") === "true" ? "1" : "0";
  const prefix = new TextEncoder().encode(
    `v${version}\n${timestamp}\n${h("X-Index-Delivery")}\n${h("X-Index-Trigger")}\n${isTest}\n`
  );
  const signed = new Uint8Array(prefix.length + rawBody.byteLength);
  signed.set(prefix);
  signed.set(new Uint8Array(rawBody), prefix.length);
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]
  );
  const sigBytes = new Uint8Array(signature.match(/../g).map((x) => parseInt(x, 16)));
  return crypto.subtle.verify("HMAC", key, sigBytes, signed);
}
