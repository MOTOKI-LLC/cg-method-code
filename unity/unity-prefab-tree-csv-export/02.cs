using UnityEngine;
using UnityEditor;
using System;
using System.IO;
using System.Text;
using System.Collections.Generic;

public static class PrefabTreeCsvExporter
{
    [MenuItem("Tools/選択フォルダ以下のPrefabツリー構造をCSV出力")]
    public static void Export()
    {
        UnityEngine.Object[] selected = Selection.objects;
        if (selected.Length != 1)
        {
            Debug.LogWarning("ProjectでAssets内のフォルダーを1つだけ選択してください。");
            return;
        }
        string folder = AssetDatabase.GetAssetPath(selected[0]);
        if (!AssetDatabase.IsValidFolder(folder) || !(folder == "Assets" || folder.StartsWith("Assets/", StringComparison.Ordinal)))
        {
            Debug.LogWarning("Assets内のフォルダーを1つ選択してください。");
            return;
        }
        var paths = new SortedSet<string>(StringComparer.Ordinal);
        foreach (string guid in AssetDatabase.FindAssets("t:Prefab", new[] { folder }))
        {
            string path = AssetDatabase.GUIDToAssetPath(guid);
            if (path.EndsWith(".prefab", StringComparison.OrdinalIgnoreCase)) paths.Add(path);
        }
        if (paths.Count == 0)
        {
            Debug.LogWarning("選択フォルダー以下に.prefabが見つかりませんでした。");
            return;
        }
        string savePath = EditorUtility.SaveFilePanel("PrefabツリーのCSVを保存", "", "Prefab_Tree_" + DateTime.Now.ToString("yyyyMMdd_HHmmss"), "csv");
        if (string.IsNullOrEmpty(savePath)) return;
        try
        {
            List<string> lines = PrefabTreeCsvFormatting.BuildLines(folder, paths);
            var csv = new StringBuilder();
            csv.Append(PrefabTreeCsvFormatting.Csv("ツリー") + "\r\n");
            foreach (string line in lines) csv.Append(PrefabTreeCsvFormatting.Csv(line) + "\r\n");
            File.WriteAllText(savePath, csv.ToString(), new UTF8Encoding(true));
            Debug.Log("PrefabツリーCSV保存完了: Prefab " + paths.Count + "件\n" + savePath);
        }
        catch (Exception e) { Debug.LogError("PrefabツリーCSV保存失敗: " + savePath + "\n" + e); }
    }
}

public static class PrefabTreeCsvFormatting
{
    private sealed class Node
    {
        public readonly SortedDictionary<string, Node> Folders = new SortedDictionary<string, Node>(StringComparer.Ordinal);
        public readonly SortedSet<string> Files = new SortedSet<string>(StringComparer.Ordinal);
    }
    public static string Csv(string value)
    {
        return "\"" + (value ?? "").Replace("\"", "\"\"") + "\"";
    }
    public static List<string> BuildLines(string rootPath, IEnumerable<string> paths)
    {
        if (string.IsNullOrEmpty(rootPath)) throw new ArgumentException("ルートを指定してください。");
        rootPath = rootPath.TrimEnd('/');
        var root = new Node();
        foreach (string path in paths)
        {
            if (string.IsNullOrEmpty(path) || !path.StartsWith(rootPath + "/", StringComparison.Ordinal)
                || !path.EndsWith(".prefab", StringComparison.OrdinalIgnoreCase)) continue;
            string[] parts = path.Substring(rootPath.Length + 1).Split('/');
            if (parts.Length > 257) throw new InvalidOperationException("保存階層が深さ256を超えました。");
            Node node = root;
            for (int i = 0; i < parts.Length - 1; i++)
            {
                Node next;
                if (!node.Folders.TryGetValue(parts[i], out next))
                {
                    next = new Node();
                    node.Folders.Add(parts[i], next);
                }
                node = next;
            }
            node.Files.Add(parts[parts.Length - 1]);
        }
        var lines = new List<string> { rootPath };
        Render(root, "", lines);
        return lines;
    }
    private static void Render(Node node, string indent, List<string> lines)
    {
        int count = node.Folders.Count + node.Files.Count;
        int index = 0;
        foreach (KeyValuePair<string, Node> folder in node.Folders)
        {
            bool last = ++index == count;
            lines.Add(indent + (last ? "└─ " : "├─ ") + folder.Key);
            Render(folder.Value, indent + (last ? "    " : "│   "), lines);
        }
        foreach (string file in node.Files)
            lines.Add(indent + (++index == count ? "└─ " : "├─ ") + file);
    }
}
