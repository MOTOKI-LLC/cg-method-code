param([ValidateSet('Collect','Restore')][string]$Mode = 'Collect',
      [Parameter(Mandatory=$true)][string]$Root,
      [Parameter(Mandatory=$true)][string]$Stage,
      [string]$List, [string]$Output, [switch]$Apply)
$ErrorActionPreference = 'Stop'
function Folder([string]$path) {
    $item = Get-Item -LiteralPath $path
    if (-not $item.PSIsContainer) { throw 'Expected a folder' }
    return $item.FullName.TrimEnd('\')
}
function Outside([string]$path, [string]$base) {
    if ($path -eq $base -or $path.StartsWith($base + '\', [StringComparison]::OrdinalIgnoreCase)) {
        throw 'Output must be outside input folders'
    }
}
function PlainFile([string]$path, [string]$base) {
    $item = Get-Item -LiteralPath $path
    if ($item.PSIsContainer -or -not $item.FullName.StartsWith($base + '\', [StringComparison]::OrdinalIgnoreCase)) {
        throw 'File must be inside the specified folder'
    }
    $check = $item
    while ($check) {
        if ($check.Attributes -band [IO.FileAttributes]::ReparsePoint) { throw 'Links/junctions are not supported' }
        if ($check.FullName.TrimEnd('\') -eq $base) { break }
        $check = if ($check.PSIsContainer) { $check.Parent } else { $check.Directory }
    }
    return $item
}
$rootPath = Folder $Root
$stagePath = [IO.Path]::GetFullPath($Stage).TrimEnd('\')
Outside $stagePath $rootPath
if ($Mode -eq 'Collect') {
    if (Test-Path -LiteralPath $stagePath) { throw 'Stage already exists' }
    if (-not $List) { throw 'List is required' }
    $paths = @(Get-Content -LiteralPath $List -Encoding UTF8 | ForEach-Object { $_.Trim().Trim('"') } | Where-Object { $_ })
    if (-not $paths.Count) { throw 'Empty path list' }
    $files = @($paths | ForEach-Object { PlainFile $_ $rootPath })
    if (@($files | Group-Object FullName | Where-Object Count -gt 1).Count) { throw 'Duplicate input paths' }
    $i = 0
    $mapping = @(foreach ($file in $files) {
        $i++
        [pscustomobject]@{
            Relative = $file.FullName.Substring($rootPath.Length + 1)
            StagedName = ('{0:D6}_' -f $i) + $file.Name
            OriginalSHA256 = (Get-FileHash -LiteralPath $file.FullName -Algorithm SHA256).Hash
        }
    })
    $mapping | Format-List Relative, StagedName
    if (-not $Apply) { Write-Host 'Preview only'; return }
    [IO.Directory]::CreateDirectory($stagePath) | Out-Null
    $mapping | Export-Csv -LiteralPath (Join-Path $stagePath 'mapping.csv') -NoTypeInformation -Encoding UTF8
    foreach ($row in $mapping) {
        $src = Join-Path $rootPath $row.Relative
        $dst = Join-Path $stagePath $row.StagedName
        if ((Get-FileHash -LiteralPath $src -Algorithm SHA256).Hash -ne $row.OriginalSHA256) { throw 'Original changed during copy' }
        [IO.File]::Copy($src, $dst, $false)
        if ((Get-FileHash -LiteralPath $dst -Algorithm SHA256).Hash -ne $row.OriginalSHA256) { throw 'Copy hash mismatch' }
    }
} else {
    $stagePath = Folder $stagePath
    if (-not $Output) { throw 'Output is required' }
    $out = [IO.Path]::GetFullPath($Output).TrimEnd('\')
    Outside $out $rootPath
    Outside $out $stagePath
    if (Test-Path -LiteralPath $out) { throw 'Output already exists' }
    $mapping = @(Import-Csv -LiteralPath (Join-Path $stagePath 'mapping.csv') -Encoding UTF8)
    if (-not $mapping.Count) { throw 'Empty mapping' }
    if (@($mapping | Group-Object Relative | Where-Object Count -gt 1).Count -or
        @($mapping | Group-Object StagedName | Where-Object Count -gt 1).Count) { throw 'Duplicate mapping' }
    $plan = @(foreach ($row in $mapping) {
        if (-not $row.Relative -or [IO.Path]::IsPathRooted($row.Relative) -or
            $row.Relative -match '(^|[\\/])\.\.?([\\/]|$)|:' -or
            -not $row.StagedName -or $row.StagedName -ne [IO.Path]::GetFileName($row.StagedName)) { throw 'Invalid mapping path' }
        $original = PlainFile (Join-Path $rootPath $row.Relative) $rootPath
        if ((Get-FileHash -LiteralPath $original.FullName -Algorithm SHA256).Hash -ne $row.OriginalSHA256) { throw 'Original changed; compare manually' }
        $edited = PlainFile (Join-Path $stagePath $row.StagedName) $stagePath
        [pscustomobject]@{
            Relative = $row.Relative
            Source = $edited.FullName
            Destination = Join-Path $out $row.Relative
            SHA256 = (Get-FileHash -LiteralPath $edited.FullName -Algorithm SHA256).Hash
            Original = $original.FullName
            OriginalSHA256 = $row.OriginalSHA256
        }
    })
    $plan | Format-List Relative, Source, Destination
    if (-not $Apply) { Write-Host 'Preview only'; return }
    [IO.Directory]::CreateDirectory($out) | Out-Null
    foreach ($row in $plan) {
        if ((Get-FileHash -LiteralPath $row.Original -Algorithm SHA256).Hash -ne $row.OriginalSHA256 -or
            (Get-FileHash -LiteralPath $row.Source -Algorithm SHA256).Hash -ne $row.SHA256) { throw 'Input changed during restore' }
        [IO.Directory]::CreateDirectory([IO.Path]::GetDirectoryName($row.Destination)) | Out-Null
        [IO.File]::Copy($row.Source, $row.Destination, $false)
        if ((Get-FileHash -LiteralPath $row.Destination -Algorithm SHA256).Hash -ne $row.SHA256) { throw 'Restore hash mismatch' }
    }
}
Write-Host ('Completed: ' + $mapping.Count)
