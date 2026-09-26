<!DOCTYPE html>
<html>
<head>
  <base target="_top">
</head>
<body>
  <iframe src="" id="ifr" width="256" height="256"></iframe>
  <script>
    // スクリプトレットでGASから値を取得
    var link = <?= PropertiesService.getScriptProperties().getProperty('link'); ?>;
    document.getElementById("ifr").src = link;
  </script>
</body>
</html>
