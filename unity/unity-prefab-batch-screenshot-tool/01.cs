using UnityEngine;
using UnityEditor;
using System.IO;
using System.Linq;

public class PrefabScreenshot
{
    [MenuItem("Tools/選択フォルダのPrefabをスクリーンショット")]
    static void TakeBatchScreenshots()
    {
        // Projectビューで選択中のフォルダを取得
        string selectedFolder = GetSelectedFolderPath();
        if (string.IsNullOrEmpty(selectedFolder))
        {
            Debug.LogError("ProjectビューでPrefabフォルダを選択してください。");
            return;
        }

        string outputFolder = EditorUtility.OpenFolderPanel("画像の出力先を選択", "", "");
        if (string.IsNullOrEmpty(outputFolder)) return;

        string[] guids = AssetDatabase.FindAssets("t:Prefab", new[] { selectedFolder });

        foreach (string guid in guids)
        {
            string prefabPath = AssetDatabase.GUIDToAssetPath(guid);
            GameObject prefab = AssetDatabase.LoadAssetAtPath<GameObject>(prefabPath);
            if (prefab == null) continue;

            Debug.Log($"Processing: {prefab.name}");

            GameObject instance = GameObject.Instantiate(prefab);
            Bounds bounds = CalculateBounds(instance);

            Camera cam = new GameObject("TempCam").AddComponent<Camera>();
            cam.backgroundColor = Color.clear;
            cam.clearFlags = CameraClearFlags.SolidColor;
            cam.orthographic = true;
            cam.orthographicSize = Mathf.Max(bounds.extents.y, bounds.extents.x);
            cam.transform.position = bounds.center + new Vector3(0, 0, -10);
            cam.nearClipPlane = 0.1f;
            cam.farClipPlane = 100f;

            int size = 512;
            RenderTexture rt = new RenderTexture(size, size, 24);
            cam.targetTexture = rt;
            cam.Render();

            RenderTexture.active = rt;
            Texture2D screenshot = new Texture2D(size, size, TextureFormat.RGBA32, false);
            screenshot.ReadPixels(new Rect(0, 0, size, size), 0, 0);
            screenshot.Apply();

            RenderTexture.active = null;
            cam.targetTexture = null;
            rt.Release();

            string filename = Path.Combine(outputFolder, prefab.name + ".png");
            File.WriteAllBytes(filename, screenshot.EncodeToPNG());

            GameObject.DestroyImmediate(instance);
            GameObject.DestroyImmediate(cam.gameObject);
        }

        AssetDatabase.Refresh();
        Debug.Log("スクリーンショット完了！");
    }

    static string GetSelectedFolderPath()
    {
        var selected = Selection.GetFiltered(typeof(Object), SelectionMode.Assets)
            .Select(obj => AssetDatabase.GetAssetPath(obj))
            .Where(path => AssetDatabase.IsValidFolder(path))
            .FirstOrDefault();

        return selected;
    }

    static Bounds CalculateBounds(GameObject go)
    {
        var renderers = go.GetComponentsInChildren<Renderer>();
        if (renderers.Length == 0)
            return new Bounds(go.transform.position, Vector3.one);

        Bounds bounds = renderers[0].bounds;
        foreach (var r in renderers)
            bounds.Encapsulate(r.bounds);
        return bounds;
    }
}
