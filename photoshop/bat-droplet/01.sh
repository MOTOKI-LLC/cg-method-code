@echo off
setlocal enabledelayedexpansion
for %%F in (*.psd) do call :sub "%%F"
goto :EOF
:sub
C:\Users\min\Desktop\グレーアウト.exe "%~dp1%~n1.psd"
goto :EOF
