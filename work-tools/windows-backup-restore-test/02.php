function Get-Tree([string]$Root) {
  $base = (Get-Item -LiteralPath $Root -Force -ErrorAction Stop).FullName.TrimEnd('\')
  if (-not (Get-Item -LiteralPath $base -Force).PSIsContainer) { throw 'フォルダーを指定してください' }
  $rows = New-Object 'System.Collections.Generic.List[string]'
  $rows.Add('#ROOT')
  function Visit([string]$Path) {
    foreach ($item in Get-ChildItem -LiteralPath $Path -Force -ErrorAction Stop) {
      if ($item.Attributes -band [IO.FileAttributes]::ReparsePoint) { throw 'リンク・ジャンクションは対象外です' }
      $rel = $item.FullName.Substring($base.Length + 1)
      if ($item.PSIsContainer) {
        $rows.Add('D:' + $rel)
        Visit $item.FullName
      } else {
        $hash = (Get-FileHash -LiteralPath $item.FullName -Algorithm SHA256 -ErrorAction Stop).Hash
        $rows.Add('F:' + $rel + ':' + $hash)
      }
    }
  }
  if ((Get-Item -LiteralPath $base -Force).Attributes -band [IO.FileAttributes]::ReparsePoint) { throw 'リンクは対象外です' }
  Visit $base
  $rows | Sort-Object
}

$a = @(Get-Tree ".\original")
$b = @(Get-Tree ".\restore-new")
Compare-Object $a $b | Select-Object SideIndicator,InputObject
