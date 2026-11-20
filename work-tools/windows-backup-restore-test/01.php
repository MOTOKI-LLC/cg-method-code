param([Parameter(Mandatory=$true)][string]$Original,
      [Parameter(Mandatory=$true)][string]$Backup,
      [Parameter(Mandatory=$true)][string]$Output)
$ErrorActionPreference = 'Stop'
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

$a = (Get-Item -LiteralPath $Original -Force).FullName.TrimEnd('\')
$b = (Get-Item -LiteralPath $Backup -Force).FullName.TrimEnd('\')
$dest = [IO.Path]::GetFullPath($Output).TrimEnd('\')
if (Test-Path -LiteralPath $dest) { throw '復元先は未作成の場所にしてください' }
foreach ($src in @($a, $b)) {
  if ($dest -eq $src -or $dest.StartsWith($src + '\', [StringComparison]::OrdinalIgnoreCase) -or $src.StartsWith($dest + '\', [StringComparison]::OrdinalIgnoreCase)) { throw '復元先と入力の包含関係は禁止です' }
}
$before = @(Get-Tree $a)
$backupBefore = @(Get-Tree $b)
New-Item -ItemType Directory -Path $dest -ErrorAction Stop | Out-Null
& robocopy.exe $b $dest /E /XJ /R:1 /W:1 /NFL /NDL /NJH /NP | Out-Host
$copyCode = $LASTEXITCODE
Write-Host "RobocopyExit=$copyCode"
if ($copyCode -ge 8) { throw 'コピー失敗。出力は未完成です' }
$restored = @(Get-Tree $dest)
$difference = @(Compare-Object $before $restored)
if (@(Compare-Object $before @(Get-Tree $a)).Count -or @(Compare-Object $backupBefore @(Get-Tree $b)).Count) { throw '検証中に入力が変わりました' }
$difference | Select-Object SideIndicator,InputObject | ConvertTo-Json
if ($difference.Count) { throw '相対パス・ファイル内容・空フォルダーに差があります' }
Write-Host '対象の通常ファイルとフォルダーが一致しました'
