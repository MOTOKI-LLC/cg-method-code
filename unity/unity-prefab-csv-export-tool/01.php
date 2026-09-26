using UnityEngine;
using UnityEditor;
using System.IO;
using System.Text;
using System.Collections.Generic;
using System;

public class ExportAllPrefabsWithPath : EditorWindow
{
    [MenuItem("Tools/Export Prefabs (with Path)")]
    public static void ExportPrefabs()
    {
        var selected = Selection.GetFiltered<UnityEngine.Object>(SelectionMode.Assets);
        HashSet<string> prefabPaths = new HashSet<string>();

        foreach (var obj in selected)
        {
            string folderAssetPath = AssetDatabase.GetAssetPath(obj);
            if (!AssetDatabase.IsValidFolder(folderAssetPath)) continue;

            string[] guids = AssetDatabase.FindAssets("t:Prefab", new[] { folderAssetPath });
            foreach (string guid in guids)
            {
                string assetPath = AssetDatabase.GUIDToAssetPath(guid);
                if (assetPath.EndsWith(".prefab") && !prefabPaths.Contains(assetPath))
                {
                    prefabPaths.Add(assetPath);
                }
            }
        }

        if (prefabPaths.Count == 0)
        {
            Debug.LogWarning("選択フォルダ内にPrefabが見つかりませんでした。");
            return;
        }

        string timestamp = DateTime.Now.ToString("yyyyMMdd_HHmmss");
        string savePath = EditorUtility.SaveFilePanel("CSVとして保存", "", $"prefab_structure_{timestamp}.csv", "csv");
        if (string.IsNullOrEmpty(savePath)) return;

        var sb = new StringBuilder();
        sb.AppendLine("Prefab名,Prefabパス,階層,GameObject名,コンポーネント");

        foreach (var path in prefabPaths)
        {
            string prefabName = Path.GetFileNameWithoutExtension(path);
            string assetPath = path.Replace("\\", "/");

            GameObject prefabRoot = null;

            try
            {
                prefabRoot = PrefabUtility.LoadPrefabContents(assetPath);
                if (prefabRoot != null)
                {
                    Traverse(prefabRoot.transform, prefabName, assetPath, prefabName, sb);
                    PrefabUtility.UnloadPrefabContents(prefabRoot);
                    continue;
                }
            }
            catch {}

            try
            {
                GameObject variantAsset = AssetDatabase.LoadAssetAtPath<GameObject>(assetPath);
                if (variantAsset != null)
                {
                    GameObject temp = GameObject.Instantiate(variantAsset);
                    Traverse(temp.transform, prefabName, assetPath, prefabName, sb);
                    GameObject.DestroyImmediate(temp);
                }
            }
            catch (Exception e)
            {
                Debug.LogError($"読み込み失敗: {assetPath}\n{e.Message}");
            }
        }

        File.WriteAllText(savePath, sb.ToString(), Encoding.UTF8);
        Debug.Log($" {prefabPaths.Count}個のPrefabをCSV出力しました。\n保存先: {savePath}");
    }

    private static void Traverse(Transform current, string prefabName, string prefabPath, string hierarchyPath, StringBuilder sb)
    {
        string gameObjectName = current.name;
        List<string> compNames = new List<string>();

        foreach (var comp in current.GetComponents<Component>())
        {
            if (comp != null)
                compNames.Add(comp.GetType().Name);
        }

        sb.AppendLine($"{prefabName},{prefabPath},{hierarchyPath},{gameObjectName},\"{string.Join(", ", compNames)}\"");

        foreach (Transform child in current)
        {
            Traverse(child, prefabName, prefabPath, hierarchyPath + "/" + child.name, sb);
        }
    }
}
