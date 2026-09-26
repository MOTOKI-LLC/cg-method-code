// Assets/Editor/PsdOverridePostprocessor.cs
using UnityEditor;
using UnityEditor.U2D.PSD;
using System;

public class PsdOverridePostprocessor : AssetPostprocessor
{
    // PSD を Texture として読み込む前に呼ばれる
    void OnPreprocessTexture()
    {
        // assetPath は「Assets/.../サンプル.psd」のような文字列
        if (assetPath.EndsWith(".psd", StringComparison.OrdinalIgnoreCase))
        {
            // 既に PSDImporter なら何もしない
            if (AssetImporter.GetAtPath(assetPath) is PSDImporter) return;

            // .psd を PSDImporter に差し替え
            AssetDatabase.SetImporterOverride<PSDImporter>(assetPath);
        }
    }
}
