@echo off
setlocal EnableExtensions

rem === 設定 ===
set "IN=C:\Users\min sui\Desktop\psd"
set "OUT=C:\Users\min sui\Desktop\png"
set "MAG=C:\Program Files\ImageMagick-7.1.2-Q16-HDRI\magick.exe"

if not exist "%OUT%" mkdir "%OUT%"

for /r "%IN%" %%F in (*.psd) do (
  "%MAG%" "%%~fF[0]" -alpha on -define psd:preserve-opacity=true -colorspace sRGB "%OUT%\%%~nF.png"
)

echo 完了
