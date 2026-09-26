    using UnityEngine;
    using UnityEditor;
    using UnityEngine.UI;
    using System.IO;
    using System.Linq;

    public class UGUIPrefabScreenshot
    {
        [MenuItem("Tools/選択フォルダのPrefabをスクリーンショット(uGUI)")]
        static void BatchScreenshotUGUIPrefabs()
        {
            string folderPath = GetSelectedFolderPath();
            if (string.IsNullOrEmpty(folderPath))
            {
                Debug.LogError("ProjectビューでPrefabフォルダを選択してください。");
                return;
            }

            string outputFolder = EditorUtility.OpenFolderPanel("画像の出力先を選択", "", "");
            if (string.IsNullOrEmpty(outputFolder)) return;

            string[] guids = AssetDatabase.FindAssets("t:Prefab", new[] { folderPath });

            foreach (string guid in guids)
            {
                string prefabPath = AssetDatabase.GUIDToAssetPath(guid);
                GameObject prefab = AssetDatabase.LoadAssetAtPath<GameObject>(prefabPath);
                if (prefab == null) continue;

                Debug.Log($"Processing: {prefab.name}");

                GameObject instance = (GameObject)PrefabUtility.InstantiatePrefab(prefab);
                instance.name = prefab.name + "_inst";

                GameObject canvasGO = new GameObject("TempCanvas", typeof(Canvas), typeof(CanvasScaler), typeof(GraphicRaycaster));
                var canvas = canvasGO.GetComponent<Canvas>();
                canvas.renderMode = RenderMode.WorldSpace;
                instance.transform.SetParent(canvasGO.transform, false);

                SetLayerRecursively(canvasGO, LayerMask.NameToLayer("UI"));

                var images = instance.GetComponentsInChildren<Image>(true);
                if (images.Length == 0)
                {
                    Debug.LogWarning($"スキップ：Imageが見つからない：{prefab.name}");
                    GameObject.DestroyImmediate(canvasGO);
                    continue;
                }

                Bounds? bounds = null;
                foreach (var img in images)
                {
                    var rt = img.GetComponent<RectTransform>();
                    if (rt == null) continue;
                    LayoutRebuilder.ForceRebuildLayoutImmediate(rt);

                    Vector3[] corners = new Vector3[4];
                    rt.GetWorldCorners(corners);
                    foreach (var c in corners)
                        bounds = bounds.HasValue ? Encapsulate(bounds.Value, c) : new Bounds(c, Vector3.zero);
                }

                if (!bounds.HasValue || bounds.Value.size == Vector3.zero)
                {
                    Debug.LogWarning($"スキップ：サイズがゼロのPrefab: {prefab.name}");
                    GameObject.DestroyImmediate(canvasGO);
                    continue;
                }

                var b = bounds.Value;
                float width = b.size.x;
                float height = b.size.y;
                Vector3 center = b.center;

                float pixelsPerUnit = 20f;
                int maxSize = 2048;
                int texWidth = Mathf.Clamp(Mathf.CeilToInt(width * pixelsPerUnit), 1, maxSize);
                int texHeight = Mathf.Clamp(Mathf.CeilToInt(height * pixelsPerUnit), 1, maxSize);

                // カメラ
                Camera cam = new GameObject("TempCam").AddComponent<Camera>();
                cam.orthographic = true;
                cam.clearFlags = CameraClearFlags.SolidColor;
                cam.backgroundColor = new Color(0, 0, 0, 0);
                cam.cullingMask = LayerMask.GetMask("UI");
                cam.orthographicSize = height / 2f;
                cam.transform.position = center + new Vector3(0, 0, -10);

                RenderTexture rtTex = new RenderTexture(texWidth, texHeight, 24);
                cam.targetTexture = rtTex;
                cam.Render();

                RenderTexture.active = rtTex;
                Texture2D tex = new Texture2D(texWidth, texHeight, TextureFormat.RGBA32, false);
                tex.ReadPixels(new Rect(0, 0, texWidth, texHeight), 0, 0);
                tex.Apply();
                RenderTexture.active = null;
                rtTex.Release();

                string filename = Path.Combine(outputFolder, prefab.name + ".png");
                File.WriteAllBytes(filename, tex.EncodeToPNG());

                GameObject.DestroyImmediate(canvasGO);
                GameObject.DestroyImmediate(cam.gameObject);
            }

            AssetDatabase.Refresh();
            Debug.Log("一括スクリーンショット完了！");
        }

        static string GetSelectedFolderPath()
        {
            return Selection.GetFiltered(typeof(Object), SelectionMode.Assets)
                .Select(obj => AssetDatabase.GetAssetPath(obj))
                .Where(path => AssetDatabase.IsValidFolder(path))
                .FirstOrDefault();
        }

        static void SetLayerRecursively(GameObject obj, int layer)
        {
            obj.layer = layer;
            foreach (Transform child in obj.transform)
                SetLayerRecursively(child.gameObject, layer);
        }

        static Bounds Encapsulate(Bounds original, Vector3 point)
        {
            original.Encapsulate(point);
            return original;
        }
    }
