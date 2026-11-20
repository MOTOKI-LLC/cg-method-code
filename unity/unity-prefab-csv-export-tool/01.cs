using UnityEngine;
using UnityEditor;
using System;
using System.IO;
using System.Text;
using System.Collections.Generic;

public static class PrefabHierarchyExporter
{
    [MenuItem("Tools/Export Prefabs (with Path)")]
    public static void ExportPrefabs()
    {
        UnityEngine.Object[] selected = Selection.objects;
        if (selected.Length == 0)
        {
            Debug.LogWarning("ProjectでAssets内のフォルダーを選択してください。");
            return;
        }
        var folders = new HashSet<string>(StringComparer.Ordinal);
        foreach (UnityEngine.Object item in selected)
        {
            string path = AssetDatabase.GetAssetPath(item);
            if (!AssetDatabase.IsValidFolder(path) || !(path == "Assets" || path.StartsWith("Assets/", StringComparison.Ordinal)))
            {
                Debug.LogWarning("選択対象はAssets内のフォルダーだけにしてください。");
                return;
            }
            folders.Add(path);
        }
        var uniquePaths = new SortedSet<string>(StringComparer.Ordinal);
        foreach (string folder in folders)
        {
            foreach (string guid in AssetDatabase.FindAssets("t:Prefab", new[] { folder }))
            {
                string path = AssetDatabase.GUIDToAssetPath(guid);
                if (path.EndsWith(".prefab", StringComparison.OrdinalIgnoreCase)) uniquePaths.Add(path);
            }
        }
        if (uniquePaths.Count == 0)
        {
            Debug.LogWarning("選択フォルダー以下に.prefabが見つかりませんでした。");
            return;
        }
        string savePath = EditorUtility.SaveFilePanel("CSVとして保存", "", "prefab_structure_" + DateTime.Now.ToString("yyyyMMdd_HHmmss"), "csv");
        if (string.IsNullOrEmpty(savePath)) return;

        var csv = new StringBuilder();
        csv.Append(PrefabHierarchyCsvFormatting.Row("Prefab名", "Prefabパス", "階層(兄弟番号付き)", "GameObject名", "コンポーネント"));
        int success = 0;
        int failed = 0;
        int rowCount = 0;
        foreach (string path in uniquePaths)
        {
            GameObject root = null;
            var perPrefab = new StringBuilder();
            int perPrefabRows = 0;
            bool loaded = false;
            try
            {
                root = PrefabUtility.LoadPrefabContents(path);
                if (root == null) throw new InvalidOperationException("Prefabのルートを取得できませんでした。");
                Traverse(root.transform, Path.GetFileNameWithoutExtension(path), path,
                    PrefabHierarchyCsvFormatting.Segment(root.name, 0), perPrefab, 0, ref perPrefabRows);
                loaded = true;
            }
            catch (Exception e)
            {
                Debug.LogError("Prefabの読取失敗: " + path + "\n" + e);
            }
            finally
            {
                if (root != null)
                {
                    try { PrefabUtility.UnloadPrefabContents(root); }
                    catch (Exception e)
                    {
                        loaded = false;
                        Debug.LogError("Prefabの解放失敗: " + path + "\n" + e);
                    }
                }
            }
            if (loaded)
            {
                csv.Append(perPrefab);
                rowCount += perPrefabRows;
                success++;
            }
            else failed++;
        }
        if (success == 0)
        {
            Debug.LogWarning("全Prefabの読取に失敗したため、CSVは保存していません。");
            return;
        }
        try
        {
            File.WriteAllText(savePath, csv.ToString(), new UTF8Encoding(true));
            Debug.Log("CSV保存完了: 候補 " + uniquePaths.Count + " / 成功 " + success + " / 失敗 " + failed
                + " / GameObject行 " + rowCount + "\n" + savePath);
        }
        catch (Exception e) { Debug.LogError("CSV保存失敗: " + savePath + "\n" + e); }
    }

    private static void Traverse(Transform node, string prefabName, string assetPath, string hierarchy,
        StringBuilder csv, int depth, ref int rowCount)
    {
        if (depth > 256) throw new InvalidOperationException("階層が深さ256を超えました。");
        var components = new List<string>();
        foreach (Component component in node.GetComponents<Component>())
            components.Add(component == null ? "[Missing Script]" : component.GetType().FullName);
        csv.Append(PrefabHierarchyCsvFormatting.Row(prefabName, assetPath, hierarchy, node.name, string.Join(", ", components)));
        rowCount++;
        foreach (Transform child in node)
            Traverse(child, prefabName, assetPath, hierarchy + "/" + PrefabHierarchyCsvFormatting.Segment(child.name, child.GetSiblingIndex()),
                csv, depth + 1, ref rowCount);
    }
}

public static class PrefabHierarchyCsvFormatting
{
    public static string Csv(string value)
    {
        return "\"" + (value ?? "").Replace("\"", "\"\"") + "\"";
    }
    public static string Row(params string[] values)
    {
        var fields = new string[values.Length];
        for (int i = 0; i < values.Length; i++) fields[i] = Csv(values[i]);
        return string.Join(",", fields) + "\r\n";
    }
    public static string Segment(string name, int siblingIndex)
    {
        return (name ?? "").Replace("%", "%25").Replace("/", "%2F").Replace("[", "%5B").Replace("]", "%5D")
            + "[" + siblingIndex + "]";
    }
}
