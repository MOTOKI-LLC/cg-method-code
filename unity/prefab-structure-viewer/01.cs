using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using UnityEditor;
using UnityEngine;

public static class ExportPrefabGraph
{
    private sealed class Node
    {
        public string Guid, Path, Name, Type, Status;
        public bool InScope;
    }
    private sealed class Edge
    {
        public string From, To, Relation;
    }
    [MenuItem("Tools/CG Method/Export Prefab Reference Graph CSV")]
    private static void Export()
    {
        if (EditorApplication.isPlayingOrWillChangePlaymode)
            throw new InvalidOperationException("Stop Play Mode before exporting.");
        string[] roots = Selection.objects.Select(AssetDatabase.GetAssetPath)
            .Where(p => (p == "Assets" || p.StartsWith("Assets/", StringComparison.Ordinal)) && AssetDatabase.IsValidFolder(p))
            .Distinct().OrderBy(p => p, StringComparer.Ordinal).ToArray();
        if (roots.Length == 0) {Debug.LogError("Select one or more Assets folders in Project."); return;}
        var paths = AssetDatabase.FindAssets("t:Prefab", roots).Select(AssetDatabase.GUIDToAssetPath)
            .Where(p => p.EndsWith(".prefab", StringComparison.OrdinalIgnoreCase))
            .Distinct().OrderBy(p => p, StringComparer.Ordinal).ToArray();
        if (paths.Length == 0) {Debug.LogWarning("No .prefab files in selected folders."); return;}
        var scope = new HashSet<string>(paths, StringComparer.Ordinal);
        var nodes = new Dictionary<string, Node>(StringComparer.Ordinal);
        var edges = new Dictionary<string, Edge>(StringComparer.Ordinal);
        int errors = 0;
        try
        {
            // Register all selected assets, including ones with no outgoing relationships.
            foreach (string path in paths) Register(path, scope, nodes);
            for (int i = 0; i < paths.Length; i++)
            {
                string path = paths[i];
                if (EditorUtility.DisplayCancelableProgressBar("Prefab reference graph", path, (float)i / paths.Length))
                {Debug.LogWarning("Cancelled. No CSV saved."); return;}
                Node source = nodes[AssetDatabase.AssetPathToGUID(path)];
                var found = new List<KeyValuePair<string, string>>();
                GameObject loaded = null;
                try
                {
                    var asset = AssetDatabase.LoadAssetAtPath<GameObject>(path);
                    if (asset == null) throw new InvalidDataException("Prefab asset could not be loaded.");
                    if (PrefabUtility.GetPrefabAssetType(asset) == PrefabAssetType.Variant)
                    {
                        var baseAsset = PrefabUtility.GetCorrespondingObjectFromSource(asset);
                        string basePath = AssetDatabase.GetAssetPath(baseAsset);
                        if (String.IsNullOrEmpty(basePath)) throw new InvalidDataException("Immediate Variant base was not found.");
                        found.Add(new KeyValuePair<string,string>(basePath, "Variant"));
                    }
                    loaded = PrefabUtility.LoadPrefabContents(path);
                    // Effective containment at every depth, NOT only immediate dependencies.
                    // Skip the loaded root: Variant inheritance is a separate relation above.
                    foreach (Transform transform in loaded.GetComponentsInChildren<Transform>(true))
                    {
                        if (transform.gameObject == loaded || !PrefabUtility.IsAnyPrefabInstanceRoot(transform.gameObject)) continue;
                        string nestedPath = PrefabUtility.GetPrefabAssetPathOfNearestInstanceRoot(transform.gameObject);
                        if (String.IsNullOrEmpty(nestedPath)) throw new InvalidDataException("Nested asset path was not found.");
                        found.Add(new KeyValuePair<string,string>(nestedPath, "Nested"));
                    }
                    // Stage per asset. A failed scan supplies no partial outgoing edges.
                    var staged = new List<Edge>();
                    foreach (var relation in found)
                    {
                        Node target = Register(relation.Key, scope, nodes);
                        if (target.Guid == source.Guid) throw new InvalidDataException("Self reference was found.");
                        staged.Add(new Edge {From=source.Guid, To=target.Guid, Relation=relation.Value});
                    }
                    foreach (Edge edge in staged)
                        edges[edge.Relation + "_" + edge.From + "_" + edge.To] = edge;
                    source.Status = "Ready";
                }
                catch (Exception error)
                {
                    source.Status = "Error"; errors++;
                    Debug.LogError("Prefab scan failed: " + path + "\n" + error);
                }
                finally
                {
                    if (loaded != null) PrefabUtility.UnloadPrefabContents(loaded);
                }
            }
        }
        catch (Exception error) {Debug.LogError("Export aborted before saving: " + error); return;}
        finally {EditorUtility.ClearProgressBar();}
        if (nodes.Count > 2000 || edges.Count > 5000)
        {Debug.LogError("Viewer limit exceeded. Select smaller folders: 2000 nodes / 5000 edges."); return;}
        var rows = new List<string[]>();
        rows.Add(PrefabGraphCsv.Header);
        foreach (Node node in nodes.Values.OrderBy(n => n.Path, StringComparer.Ordinal))
            rows.Add(new[] {"Node",node.Guid,node.Path,node.Name,node.Type,"","",node.InScope ? "true" : "false",node.Status});
        foreach (var entry in edges.OrderBy(e => e.Key, StringComparer.Ordinal))
        {Edge e = entry.Value; rows.Add(new[] {"Edge",e.From,"","","",e.To,e.Relation,"",""});}
        if (rows.Count > 10000) {Debug.LogError("Too many CSV rows."); return;}
        string output = EditorUtility.SaveFilePanel("Save Prefab graph CSV", "", "prefab_graph_" + DateTime.Now.ToString("yyyyMMdd_HHmmss") + ".csv", "csv");
        if (String.IsNullOrEmpty(output)) return;
        try
        {
            byte[] data = new UTF8Encoding(true).GetPreamble().Concat(Encoding.UTF8.GetBytes(PrefabGraphCsv.Encode(rows))).ToArray();
            using (var file = new FileStream(output, FileMode.CreateNew, FileAccess.Write, FileShare.None))
                file.Write(data, 0, data.Length);
            Debug.Log("CSV saved: " + output + "; nodes=" + nodes.Count + "; edges=" + edges.Count + "; failed=" + errors);
        }
        catch (Exception error) {Debug.LogError("CSV save failed; check for an incomplete file: " + output + "\n" + error);}
    }
    private static Node Register(string path, HashSet<string> scope, Dictionary<string,Node> nodes)
    {
        if (!path.StartsWith("Assets/", StringComparison.Ordinal))
            throw new InvalidDataException("This schema handles Assets paths only: " + path);
        string guid = AssetDatabase.AssetPathToGUID(path);
        if (String.IsNullOrEmpty(guid)) throw new InvalidDataException("Asset GUID not found: " + path);
        Node existing;
        if (nodes.TryGetValue(guid, out existing)) return existing;
        var asset = AssetDatabase.LoadAssetAtPath<GameObject>(path);
        if (asset == null) throw new InvalidDataException("Referenced asset could not be loaded: " + path);
        var type = PrefabUtility.GetPrefabAssetType(asset);
        if (type != PrefabAssetType.Regular && type != PrefabAssetType.Variant && type != PrefabAssetType.Model)
            throw new InvalidDataException("Unsupported Prefab type: " + path);
        var node = new Node {Guid=guid, Path=path, Name=System.IO.Path.GetFileNameWithoutExtension(path),
            Type=type.ToString(), InScope=scope.Contains(path), Status=scope.Contains(path) ? "Error" : "ReferencedOnly"};
        nodes.Add(guid,node); return node;
    }
}

public static class PrefabGraphCsv
{
    public static readonly string[] Header = {"Record","GUID","Path","Name","AssetType","TargetGUID","Relation","InScope","ScanStatus"};
    public static string Encode(IEnumerable<string[]> rows)
    {
        var output = new StringBuilder();
        foreach (string[] row in rows)
        {
            if (row == null || row.Length != 9) throw new ArgumentException("Nine columns are required.");
            for (int i = 0; i < row.Length; i++)
            {
                if (i != 0) output.Append(',');
                output.Append('"').Append((row[i] ?? "").Replace("\"", "\"\"")).Append('"');
            }
            output.Append("\r\n");
        }
        return output.ToString();
    }
}
