// Unity 6.3 API-based sample. Unity compilation/rendering has not been verified.
// Save in Assets/Editor/SpritePrefabPngExporter.cs. Keep only one copy of this class.
using System;
using System.IO;
using System.Linq;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.Rendering;
using UnityEngine.SceneManagement;


public static class SpritePrefabPngExporter
{
    private const int Size = 512;
    private const double Padding = 0.05;

    [MenuItem("Tools/CG Method/Export Sprite Prefabs to PNG")]
    public static void Export()
    {
        if (EditorApplication.isPlayingOrWillChangePlaymode)
            throw new InvalidOperationException("Use this command outside Play Mode.");
        var selected = Selection.objects;
        if (selected.Length != 1)
            throw new InvalidOperationException("Select exactly one Assets folder.");
        string folder = AssetDatabase.GetAssetPath(selected[0]);
        if (!(folder == "Assets" || folder.StartsWith("Assets/", StringComparison.Ordinal)) ||
            !AssetDatabase.IsValidFolder(folder))
            throw new InvalidOperationException("Select a folder below Assets in the Project window.");
        var paths = AssetDatabase.FindAssets("t:Prefab", new[] { folder })
            .Select(AssetDatabase.GUIDToAssetPath)
            .Where(p => p.EndsWith(".prefab", StringComparison.OrdinalIgnoreCase))
            .Distinct().OrderBy(p => p, StringComparer.Ordinal).ToArray();
        if (paths.Length == 0) { Debug.Log("No .prefab assets found: " + folder); return; }
        string parent = EditorUtility.OpenFolderPanel("Choose PNG output folder", "", "");
        if (string.IsNullOrEmpty(parent)) return;
        string output = Path.Combine(parent, "sprite_" +
            DateTime.UtcNow.ToString("yyyyMMdd_HHmmss") + "_" + Guid.NewGuid().ToString("N"));
        Directory.CreateDirectory(output);
        int success = 0, skipped = 0, failed = 0, processed = 0;
        bool cancelled = false;
        try
        {
            foreach (string path in paths)
            {
                if (EditorUtility.DisplayCancelableProgressBar("Prefab PNG", path,
                    (float)processed / paths.Length)) { cancelled = true; break; }
                try
                {
                    var asset = AssetDatabase.LoadAssetAtPath<GameObject>(path);
                    if (asset == null) throw new InvalidOperationException("Prefab could not be loaded.");
                    string png = Path.Combine(output, SpritePrefabPngExporterFormatting.FileName(
                        Path.GetFileNameWithoutExtension(path), AssetDatabase.AssetPathToGUID(path)));
                    string reason;
                    if (Capture(asset, png, out reason)) success++;
                    else { skipped++; Debug.LogWarning("Skipped " + path + ": " + reason); }
                }
                catch (Exception error) { failed++; Debug.LogError("Failed " + path + ": " + error); }
                finally { processed++; }
            }
        }
        finally
        {
            EditorUtility.ClearProgressBar();
            Debug.Log("Candidates=" + paths.Length + ", processed=" + processed +
                ", success=" + success + ", skipped=" + skipped + ", failed=" + failed +
                ", cancelled=" + cancelled + "\nOutput: " + output);
        }
    }

    private static bool Capture(GameObject asset, string png, out string reason)
    {
        reason = "";
        Scene preview = EditorSceneManager.NewPreviewScene();
        RenderTexture previous = RenderTexture.active;
        RenderTexture target = null;
        Texture2D image = null;
        Camera camera = null;
        try
        {
            var copy = PrefabUtility.InstantiatePrefab(asset, preview) as GameObject;
            if (copy == null) throw new InvalidOperationException("Could not instantiate prefab.");
            if (!copy.activeInHierarchy) { reason = "Inactive prefab root."; return false; }
            foreach (var c in copy.GetComponentsInChildren<Camera>(true)) c.enabled = false;
            // Do not enable hidden objects or execute Play Mode animation.
            Bounds bounds;
            var renderers = copy.GetComponentsInChildren<Renderer>(false)
                .Where(r => r.enabled && r.gameObject.activeInHierarchy).ToArray();
            if (renderers.Any(r => !(r is SpriteRenderer)))
            { reason = "This sample accepts SpriteRenderer-only prefabs, not Mesh/Particle renderers."; return false; }
            var sprites = renderers.OfType<SpriteRenderer>().Where(r => r.sprite != null).ToArray();
            if (sprites.Length == 0) { reason = "No active enabled SpriteRenderer with a sprite."; return false; }
            bounds = sprites[0].bounds;
            foreach (var sprite in sprites.Skip(1)) bounds.Encapsulate(sprite.bounds);
            if (bounds.size.x <= 0 || bounds.size.y <= 0)
            { reason = "Bounds have zero width or height."; return false; }
            var cameraObject = new GameObject("CG Method capture camera");
            SceneManager.MoveGameObjectToScene(cameraObject, preview);
            camera = cameraObject.AddComponent<Camera>();
            camera.enabled = false;
            camera.scene = preview;
            camera.clearFlags = CameraClearFlags.SolidColor;
            camera.backgroundColor = new Color(0, 0, 0, 0);
            camera.orthographic = true;
            camera.allowHDR = false;
            camera.allowMSAA = false;
            camera.cullingMask = ~0;
            int pw, ph;
            pw = ph = Size;
            double framedWidth = bounds.size.x * (1.0 + Padding * 2.0);
            double framedHeight = bounds.size.y * (1.0 + Padding * 2.0);
            camera.aspect = (float)pw / ph;
            camera.orthographicSize = (float)SpritePrefabPngExporterFormatting.HalfHeight(framedWidth, framedHeight, pw, ph);
            camera.transform.SetPositionAndRotation(new Vector3(bounds.center.x,
                bounds.center.y, bounds.min.z - 10f), Quaternion.identity);
            camera.nearClipPlane = 0.01f;
            camera.farClipPlane = Mathf.Max(20f, bounds.size.z + 20f);
            target = new RenderTexture(pw, ph, 24, RenderTextureFormat.ARGB32);
            target.antiAliasing = 1;
            if (!target.Create()) throw new InvalidOperationException("RenderTexture allocation failed.");
            camera.targetTexture = target;
            
            if (GraphicsSettings.currentRenderPipeline == null) camera.Render();
            else
            {
                var request = new RenderPipeline.StandardRequest { destination = target };
                if (!RenderPipeline.SupportsRenderRequest(camera, request))
                    throw new NotSupportedException("The active pipeline does not support StandardRequest. " +
                        "Check pipeline/camera configuration; do not assume SRP or alpha support.");
                RenderPipeline.SubmitRenderRequest(camera, request);
            }
            RenderTexture.active = target;
            image = new Texture2D(pw, ph, TextureFormat.RGBA32, false);
            image.ReadPixels(new Rect(0, 0, pw, ph), 0, 0, false);
            image.Apply(false, false);
            byte[] bytes = image.EncodeToPNG();
            if (bytes == null || bytes.Length == 0) throw new InvalidOperationException("PNG encoding failed.");
            if (!image.GetPixels32().Any(pixel => pixel.a != 0))
                Debug.LogWarning("PNG is fully transparent; inspect rendering conditions: " + png);
            // Publish only a complete file. Do not replace an existing output.
            string temporary = png + ".tmp";
            bool ownsTemporary = false;
            try
            {
                using (var file = new FileStream(temporary, FileMode.CreateNew, FileAccess.Write))
                {
                    ownsTemporary = true;
                    file.Write(bytes, 0, bytes.Length);
                }
                File.Move(temporary, png);
            }
            finally
            {
                if (ownsTemporary && File.Exists(temporary)) File.Delete(temporary);
            }
            Debug.Log("Saved " + pw + "x" + ph + ": " + png);
            return true;
        }
        finally
        {
            RenderTexture.active = previous;
            if (camera != null) camera.targetTexture = null;
            try
            {
                if (image != null) UnityEngine.Object.DestroyImmediate(image);
                if (target != null) { target.Release(); UnityEngine.Object.DestroyImmediate(target); }
            }
            finally
            {
                // Close also if explicit resource cleanup throws.
                if (preview.IsValid() && !EditorSceneManager.ClosePreviewScene(preview))
                    Debug.LogError("Could not close capture preview scene.");
            }
        }
    }
}

public static class SpritePrefabPngExporterFormatting
{
    public static void Dimensions(double width, double height, double density,
        int limit, out int pixelsWide, out int pixelsHigh)
    {
        if (double.IsNaN(width) || double.IsInfinity(width) || width <= 0 ||
            double.IsNaN(height) || double.IsInfinity(height) || height <= 0 ||
            double.IsNaN(density) || double.IsInfinity(density) || density <= 0 || limit < 1)
            throw new ArgumentOutOfRangeException("Positive finite dimensions required.");
        double longest = Math.Max(width, height);
        double scale = Math.Min(density, limit / longest);
        pixelsWide = Math.Max(1, Math.Min(limit, (int)Math.Ceiling(width * scale)));
        pixelsHigh = Math.Max(1, Math.Min(limit, (int)Math.Ceiling(height * scale)));
    }

    public static double HalfHeight(double width, double height, int pw, int ph)
    {
        return Math.Max(height / 2.0, width * ph / (2.0 * pw));
    }

    public static string FileName(string name, string guid)
    {
        if (string.IsNullOrEmpty(guid) || guid.Length != 32 ||
            !guid.All(c => "0123456789abcdefABCDEF".IndexOf(c) >= 0))
            throw new ArgumentException("Expected an AssetDatabase GUID.");
        var safe = new string((name ?? "Prefab").Select(c =>
            c < 32 || "<>:\"/\\|?*".IndexOf(c) >= 0 ? '_' : c).ToArray());
        safe = safe.Trim().TrimEnd('.');
        if (safe.Length == 0) safe = "Prefab";
        if (safe.Length > 64) safe = safe.Substring(0, 64);
        // Prefix also avoids reserved Windows base names such as CON.
        return "prefab_" + safe + "_" + guid.ToLowerInvariant() + ".png";
    }
}
