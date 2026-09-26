using UnityEngine;
using UnityEditor;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;

public class PrefabTreeCsvExporter
{
    [MenuItem("Tools/選択フォルダ以下のPrefabツリー構造をCSV出力")]
    public static void Export()
    {
        var selectedPath = Selection.assetGUIDs
            .Select(guid => AssetDatabase.GUIDToAssetPath(guid))
            .FirstOrDefault(path => AssetDatabase.IsValidFolder(path));

        if (string.IsNullOrEmpty(selectedPath))
        {
            EditorUtility.DisplayDialog("エラー", "Projectビューでフォルダを1つ選択してください。", "OK");
            return;
        }

        string rootPhysicalPath = Path.Combine(Application.dataPath.Replace("Assets", ""), selectedPath);
        string exportFolder = EditorUtility.OpenFolderPanel("出力先フォルダを選択", "", "");
        if (string.IsNullOrEmpty(exportFolder)) return;

        List<string> lines = new List<string> { "/" };
        AddTreeRecursive(rootPhysicalPath, "", lines, true);

        string fileName = $"Prefab_Tree_{DateTime.Now:yyyyMMdd_HHmmss}.csv";
        File.WriteAllLines(Path.Combine(exportFolder, fileName), lines);

        EditorUtility.RevealInFinder(exportFolder);
        Debug.Log("Prefabツリー構造を書き出しました: " + exportFolder);
    }

    private static void AddTreeRecursive(string currentPath, string indent, List<string> lines, bool isRoot)
    {
        var dirInfo = new DirectoryInfo(currentPath);

        // フォルダ名（ルート除く）
        if (!isRoot)
        {
            string prefix = indent + "└─ ";
            lines.Add($"{prefix}{dirInfo.Name}");
            indent += "    ";
        }

        var subDirs = dirInfo.GetDirectories().OrderBy(d => d.Name).ToList();
        var prefabs = dirInfo.GetFiles("*.prefab").OrderBy(f => f.Name).ToList();

        // フォルダ + prefab を1つのリストに結合（順番保持）
        var totalCount = subDirs.Count + prefabs.Count;
        int index = 0;

        // フォルダ
        foreach (var sub in subDirs)
        {
            bool isLast = (++index == totalCount);
            string subIndent = indent + (isLast ? "    " : "│   ");
            string branch = indent + (isLast ? "└─ " : "├─ ");
            lines.Add($"{branch}{sub.Name}");
            AddTreeRecursive(sub.FullName, subIndent, lines, true);
        }

        // プレハブ
        foreach (var prefab in prefabs)
        {
            bool isLast = (++index == totalCount);
            string branch = indent + (isLast ? "└─ " : "├─ ");
            lines.Add($"{branch}{prefab.Name}");
        }
    }
}
