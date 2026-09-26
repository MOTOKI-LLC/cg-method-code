using UnityEditor;
using UnityEngine;
using System.IO;
using System;

public static class Batch_HelloWriter
{
    public static void Run()
    {
        Debug.Log("=== Batch_HelloWriter.Run START ===");
        try
        {
            // デスクトップパスを取得
            string desktopPath = Environment.GetFolderPath(Environment.SpecialFolder.Desktop);

            // 出力ファイルのパス
            string outputPath = Path.Combine(desktopPath, "hello.txt");

            // ファイル書き出し
            File.WriteAllText(outputPath, "Hello from Unity batch mode!");

            Debug.Log($"ファイルを書き出しました: {outputPath}");
        }
        catch (Exception ex)
        {
            Debug.LogError("書き出し失敗: " + ex);
        }
        Debug.Log("=== Batch_HelloWriter.Run END ===");
    }
}
