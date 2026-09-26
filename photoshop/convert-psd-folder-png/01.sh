@echo off
setlocal EnableExtensions

set "IN=C:\Users\min sui\Desktop\psd"
set "OUT=C:\Users\min sui\Desktop\png"
set "MAG=C:\Program Files\ImageMagick-7.1.2-Q16-HDRI\magick.exe"

if not exist "%OUT%" mkdir "%OUT%"

for /r "%IN%" %%F in (*.psd) do (
  "%MAG%" "%%~fF" -alpha on -define psd:preserve-opacity=true -colorspace sRGB "%OUT%\%%~nF.png"
)

echo 完了
