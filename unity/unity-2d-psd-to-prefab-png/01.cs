// Assets/Editor/PsdOverridePostprocessor.cs
using UnityEditor;
using UnityEditor.U2D.PSD;
using System;
using System.IO;

public static class PsdOverridePostprocessor
{
    [MenuItem("Assets/BG/PSD Importerに切り替え")]
    private static void SwitchSelected()
    {
        foreach (var asset in Selection.objects)
        {
            string path = AssetDatabase.GetAssetPath(asset);
            if (!string.Equals(Path.GetExtension(path), ".psd",
                               StringComparison.OrdinalIgnoreCase)) continue;
            if (AssetImporter.GetAtPath(path) is PSDImporter) continue;
            AssetDatabase.SetImporterOverride<PSDImporter>(path);
        }
    }
}
