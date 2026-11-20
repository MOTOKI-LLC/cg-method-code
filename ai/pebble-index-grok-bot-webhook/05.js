// fetch(request) を fetch(request, env) にして、本文を読む前にこう差し込む
const rawBody = await request.arrayBuffer();
if (!(await verifyIndexSignature(request, rawBody, env.INDEX_WEBHOOK_SECRET))) {
  return new Response("invalid signature", { status: 401 });
}
// フォームは、先に読んだ本文から作り直して読む
const form = await new Response(rawBody, { headers: { "content-type": ct } }).formData();
