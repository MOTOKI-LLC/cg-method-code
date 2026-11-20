import { Codex } from "@openai/codex-sdk";

const codex = new Codex();
const thread = codex.startThread();
const result = await thread.run("CIの失敗を調べて直す計画を立てて");
console.log(result.finalResponse);
// 同じthreadへ続けて指示を送る例（確認待ちは自動挿入されない）
const implementation = await thread.run("その計画を実装して");
console.log(implementation.finalResponse);
