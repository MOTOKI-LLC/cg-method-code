@echo off
set "UNITY=C:\Program Files\Unity\6000.1.4f1\Editor\Unity.exe"
set "PROJECT=C:\Users\your.name\Documents\YourUnityProject"
set "LOG=%~dp0log_hello.txt"

"%UNITY%" -batchmode -quit -nographics ^
 -projectPath "%PROJECT%" ^
 -executeMethod Batch_HelloWriter.Run ^
 -logFile "%LOG%"

echo ExitCode=%ERRORLEVEL%
pause
