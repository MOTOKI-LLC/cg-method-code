<!doctype html>
<html lang="ja">
<head>
  <base target="_top">
  <meta charset="UTF-8">
  <style>body{font-family:sans-serif;margin:24px;max-width:36em}input,button{font:inherit;padding:8px}#message{white-space:pre-wrap;overflow-wrap:anywhere}</style>
</head>
<body>
  <h1>練習用文書のコピー</h1>
  <form id="copyForm">
    <label>新しいファイル名 <input id="fileName" required maxlength="80"></label>
    <button id="submitButton" type="submit">コピーする</button>
  </form>
  <p id="message" role="status"></p>
  <script>
    const form = document.getElementById('copyForm');
    const button = document.getElementById('submitButton');
    const message = document.getElementById('message');
    let busy = false;
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (busy) return;
      busy = true;
      button.disabled = true;
      message.textContent = 'コピーしています。';
      google.script.run
        .withSuccessHandler(result => {
          message.textContent = 'コピーしました：' + result.name + '\nファイルID：' + result.id + '\n保存先で内容を確認してください。';
          // 成功後は連続実行せず、保存先を確認します。
        })
        .withFailureHandler(error => {
          message.textContent = '完了を確認できません：' + error.message + '\n再送する前に保存先を確認してください。';
          busy = false;
          button.disabled = false;
        })
        .copyPracticeFile(document.getElementById('fileName').value);
    });
  </script>
</body>
</html>
