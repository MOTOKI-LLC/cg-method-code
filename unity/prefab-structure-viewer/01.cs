/**
 * ExportPrefabRelationships.cs  (Assets/Editor に配置)
 *
 * 選択フォルダ配下の Prefab 依存関係を日時入り CSV で書き出す。
 * 列   : 親Prefab名, フォルダ名, 子Prefab名, 関係種別
 * 種別 : Variant … Variant → Base（+ 疑似 Nested 行）
 *        Nested  … 親 Prefab にネストされている子 Prefab
 *        Base    … ほかの Prefab から参照されるが、自身は何も参照しない Prefab
 *        単独    … 参照関係を一切持たない Prefab
 */

using UnityEngine;
using UnityEditor;
using System;
using System.IO;
using System.Text;
using System.Linq;
using System.Collections.Generic;

public static class ExportPrefabRelationships
{
    private const string MENU = "Tools/選択フォルダのPrefab関係をCSV出力";

    [MenuItem(MENU)]
    private static void Export()
    {
        /* ---------- 1. 選択フォルダ確認 ---------- */
        var roots = Selection.GetFiltered<UnityEngine.Object>(SelectionMode.Assets)
                             .Select(AssetDatabase.GetAssetPath)
                             .Where(AssetDatabase.IsValidFolder)
                             .ToArray();

        if (roots.Length == 0)
        {
            EditorUtility.DisplayDialog("エラー", "Project ウインドウでフォルダを選択してください。", "OK");
            return;
        }

        /* ---------- 2. Prefab 一覧 ---------- */
        string[] prefabGUIDs = AssetDatabase.FindAssets("t:Prefab", roots);
        string[] prefabPaths = prefabGUIDs.Select(AssetDatabase.GUIDToAssetPath).ToArray();
        var pathByName       = prefabPaths.ToDictionary(p => Path.GetFileNameWithoutExtension(p), p => p);

        /* ---------- 3. 結果格納 ---------- */
        var relations = new HashSet<(string parent, string folder, string child, string type)>();

        /* ===== 3-A) Variant → Base ===== */
        foreach (string path in prefabPaths)
        {
            var variantGO = AssetDatabase.LoadAssetAtPath<GameObject>(path);
            if (PrefabUtility.GetPrefabAssetType(variantGO) != PrefabAssetType.Variant) continue;

            var baseGO = PrefabUtility.GetCorrespondingObjectFromSource(variantGO);
            if (baseGO == null) continue;

            string folder      = GetTopFolder(path, roots);
            string variantName = variantGO.name;
            string baseName    = baseGO.name;

            relations.Add((variantName, folder, baseName, "Variant"));
            relations.Add((variantName, folder, baseName, "Nested"));   // 疑似 Nested 行
        }

        /* ===== 3-B) Nested（直下のみ）===== */
        foreach (string parentPath in prefabPaths)
        {
            string parentName = Path.GetFileNameWithoutExtension(parentPath);
            string folderName = GetTopFolder(parentPath, roots);

            var seen = new HashSet<string>(); // 親ごと重複排除

            using var scope = new PrefabScope(parentPath);
            foreach (Transform tr in scope.Root.transform)
            {
                // 子Prefabインスタンスの直下のみ検査（Transform階層1つ下）
                if (!PrefabUtility.IsPartOfPrefabInstance(tr.gameObject)) continue;

                GameObject instRoot = PrefabUtility.GetNearestPrefabInstanceRoot(tr.gameObject);
                if (instRoot == null || instRoot == scope.Root) continue;

                var src = PrefabUtility.GetCorrespondingObjectFromSource(instRoot);
                if (src == null) continue;

                string childName = src.name;
                if (!seen.Add(childName)) continue;

                relations.Add((parentName, folderName, childName, "Nested"));
            }
        }

        /* ===== 3-C) 単独・Base ===== */
        var parents = relations.Select(r => r.parent).ToHashSet();
        var childs  = relations.Select(r => r.child).Where(c => !string.IsNullOrEmpty(c)).ToHashSet();

        foreach (string prefabName in pathByName.Keys)
        {
            bool isParent = parents.Contains(prefabName);
            bool isChild  = childs.Contains(prefabName);

            if (isParent && isChild) continue;                // 親にも子にも出ている → 既に行が存在
            string folder = GetTopFolder(pathByName[prefabName], roots);

            if (!isParent && !isChild)
            {   // 参照を全く持たない
                relations.Add((prefabName, folder, "", "単独"));
            }
            else if (!isParent && isChild)
            {   // 子にしか出てこない（＝Base）
                relations.Add((prefabName, folder, "", "Base"));
            }
            // 親のみ（isParent && !isChild）は既に Variant/Nested 行があるので追加不要
        }

        /* ---------- 4. CSV 出力 ---------- */
        var sb = new StringBuilder();
        sb.AppendLine("親Prefab名,フォルダ名,子Prefab名,関係種別");

        foreach (var r in relations
                         .OrderBy(r => r.parent)
                         .ThenBy(r => r.type)
                         .ThenBy(r => r.child))
        {
            sb.AppendLine($"{r.parent},{r.folder},{r.child},{r.type}");
        }

        string ts     = DateTime.Now.ToString("yyyyMMdd_HHmmss");
        string fname  = $"PrefabRelationships_{ts}.csv";
        string saveTo = EditorUtility.SaveFilePanel("CSV を保存", Application.dataPath, fname, "csv");
        if (string.IsNullOrEmpty(saveTo)) return;

        File.WriteAllText(saveTo, sb.ToString(), Encoding.UTF8);
        EditorUtility.RevealInFinder(saveTo);
        Debug.Log($"CSV 出力完了: {saveTo}");
    }

    /* ---------- ルート直下フォルダ名を取得 ---------- */
    private static string GetTopFolder(string prefabPath, string[] roots)
    {
        foreach (string root in roots)
        {
            if (!prefabPath.StartsWith(root)) continue;
            string rel = prefabPath.Substring(root.Length).TrimStart('/');
            string first = rel.Split('/')[0];
            return string.IsNullOrEmpty(first) ? Path.GetFileName(root) : first;
        }
        return Path.GetFileName(Path.GetDirectoryName(prefabPath));
    }

    /* ---------- PrefabContents スコープ ---------- */
    private readonly struct PrefabScope : IDisposable
    {
        public readonly GameObject Root;
        public PrefabScope(string path) => Root = PrefabUtility.LoadPrefabContents(path);
        public void Dispose()           => PrefabUtility.UnloadPrefabContents(Root);
    }
}
