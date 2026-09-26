@echo off

:: Unity.exe のパス（クォートなし）
set UNITY=C:\Program Files\Unity\Hub\Editor\6000.1.4f1\Editor\Unity.exe

:: プロジェクトのルートパス（Assetsフォルダの1階層上）
set PROJECT_PATH=C:\Users\your.name\Documents\YourUnityProject

:: ログ保存用フォルダを作成（なければ作る）
if not exist logs mkdir logs

echo === Unity バッチモード実行開始 ===

:: ▼ HelloWriter の実行
"%UNITY%" -batchmode -quit -nographics ^
 -projectPath "%PROJECT_PATH%" ^
 -executeMethod Batch_HelloWriter.Run ^
 -logFile logs\hello_log.txt

:: ▼ PrefabChecker の実行（例）
"%UNITY%" -batchmode -quit -nographics ^
 -projectPath "%PROJECT_PATH%" ^
 -executeMethod Batch_PrefabChecker.Run ^
 -logFile logs\prefab_log.txt

:: ▼ TextureOptimizer の実行（例）
"%UNITY%" -batchmode -quit -nographics ^
 -projectPath "%PROJECT_PATH%" ^
 -executeMethod Batch_TextureOptimizer.Run ^
 -logFile logs\texture_log.txt

echo === Unity バッチモード実行完了 ===
pause
