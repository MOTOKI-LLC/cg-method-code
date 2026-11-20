async function main() {
  const token = process.env.FIGMA_TOKEN;
  const fileKey = process.env.FIGMA_FILE_KEY;
  if (!token || !fileKey) {
    throw new Error('FIGMA_TOKENとFIGMA_FILE_KEYを設定してください');
  }
  const url = 'https://api.figma.com/v1/files/' + encodeURIComponent(fileKey);
  const response = await fetch(url, {
    headers: { 'X-Figma-Token': token }
  });
  if (!response.ok) {
    const retry = response.headers.get('Retry-After');
    throw new Error('Figma API HTTP ' + response.status +
      (retry ? ' / Retry-After: ' + retry + '秒' : ''));
  }
  const data = await response.json();
  console.log('ファイル名:', data.name);
}
main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
