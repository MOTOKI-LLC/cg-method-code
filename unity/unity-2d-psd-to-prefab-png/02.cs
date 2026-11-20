// Assets/Editor/PsdToPrefabExporter.cs
using UnityEditor;
using UnityEngine;
using System.IO;
using System.Linq;

public static class PsdToPrefabExporter
{
    /// <summary>
    /// 選択 PSD → Prefab＋PNG 一括変換
    /// </summary>
    [MenuItem("Assets/BG/PSD → Prefab＋PNG (階層保持)", false, 30)]
    private static void ConvertSelectedPsd()
    {
        foreach (var psd in Selection.objects)
        {
            string psdPath = AssetDatabase.GetAssetPath(psd);
            if (Path.GetExtension(psdPath).ToLower() != ".psd") continue;

            // ---------- ① 出力ディレクトリ ----------
            string prefabRoot = "Assets/Prefabs";
            string dir        = prefabRoot + "/Export_" + System.Guid.NewGuid().ToString("N");
            Directory.CreateDirectory(dir);
            AssetDatabase.Refresh();

            // ---------- ② PSDImporter が生成した階層付き GO ----------
            var rootGo = AssetDatabase.LoadAllAssetsAtPath(psdPath)
                                       .OfType<GameObject>()
                                       .FirstOrDefault();

            if (rootGo == null)
            {
                Debug.LogWarning($"Sprite のルートが見つかりません : {psdPath}");
                continue;
            }

            // ---------- ③ 一時インスタンス化 ----------
            var instance = (GameObject)PrefabUtility.InstantiatePrefab(rootGo);
            try
            {
                PrefabUtility.UnpackPrefabInstance(instance, PrefabUnpackMode.Completely, InteractionMode.AutomatedAction);
                int index = 0;

                // ---------- ④ PNG 書き出し＆置換 ----------
                foreach (var sr in instance.GetComponentsInChildren<SpriteRenderer>(true))
                {
                    if (sr.sprite == null) continue;
                    var sprite = sr.sprite;

                    // ④‑A: PNG 出力
                    string pngPath = dir + $"/layer_{index++:D4}.png";
                    SaveSpriteAsPng(sprite, pngPath);

                    // ④‑B: インポート設定を Sprite に
                    SetPngAsSprite(pngPath, sprite);

                    // ④‑C: SpriteRenderer が参照先を差し替え
                    var replacement = AssetDatabase.LoadAssetAtPath<Sprite>(pngPath);
                    if (replacement == null) throw new System.InvalidOperationException("PNGをSpriteとして読み込めません: " + pngPath);
                    sr.sprite = replacement;
                }

                if (index == 0)
                    throw new System.InvalidOperationException("出力できるSpriteがありません。Layer Managementの取り込み対象とUse as Rigを確認してください");

                // ---------- ⑤ Prefab 保存 ----------
                string prefabPath = dir + "/export.prefab";
                if (PrefabUtility.SaveAsPrefabAsset(instance, prefabPath) == null)
                    throw new System.InvalidOperationException("Prefabの保存に失敗しました");

                // ---------- ⑥ 後片付け ----------
                // 一時オブジェクトはfinallyで破棄します。
                AssetDatabase.Refresh();

                Debug.Log($"{psd.name} 変換完了 → {prefabPath}");
            }
            catch (System.Exception ex)
            {
                Debug.LogError($"変換失敗: {psdPath}\n途中の出力: {dir}\n{ex}");
            }
            finally
            {
                if (instance != null) Object.DestroyImmediate(instance);
            }
        }
    }

    // .psd が選択されていないとメニューを無効化
    [MenuItem("Assets/BG/PSD → Prefab＋PNG (階層保持)", true)]
    private static bool Validate() =>
        Selection.objects.Any(o => Path.GetExtension(AssetDatabase.GetAssetPath(o)).ToLower() == ".psd");

    // ---------- Utility ----------

    /// <summary>Sprite 部分だけ切り取って PNG 書き出し</summary>
    private static void SaveSpriteAsPng(Sprite sprite, string pngPath)
    {
        if (sprite.packed) throw new System.NotSupportedException("AtlasにパックされたSpriteは対象外です");
        int w = (int)sprite.rect.width;
        int h = (int)sprite.rect.height;
        int x = (int)sprite.rect.x;
        int y = (int)sprite.rect.y;
        if (w <= 0 || h <= 0) throw new System.InvalidOperationException("Spriteの寸法が不正です");
        var prev = RenderTexture.active;
        bool previousSrgbWrite = GL.sRGBWrite;
        RenderTexture rt = null;
        Texture2D tex = null;
        try
        {
            rt = RenderTexture.GetTemporary(sprite.texture.width, sprite.texture.height,
                0, RenderTextureFormat.ARGB32, RenderTextureReadWrite.sRGB);
            GL.sRGBWrite = QualitySettings.activeColorSpace == ColorSpace.Linear;
            Graphics.Blit(sprite.texture, rt);
            RenderTexture.active = rt;
            tex = new Texture2D(w, h, TextureFormat.RGBA32, false, false);
            tex.ReadPixels(new Rect(x, y, w, h), 0, 0);
            tex.Apply();
            File.WriteAllBytes(pngPath, ImageConversion.EncodeToPNG(tex));
        }
        finally
        {
            RenderTexture.active = prev;
            GL.sRGBWrite = previousSrgbWrite;
            if (rt != null) RenderTexture.ReleaseTemporary(rt);
            if (tex != null) Object.DestroyImmediate(tex);
        }
    }

    /// <summary>PNG を Sprite として再インポート</summary>
    private static void SetPngAsSprite(string path, Sprite source)
    {
        AssetDatabase.ImportAsset(path);
        if (AssetImporter.GetAtPath(path) is TextureImporter ti)
        {
            ti.textureType          = TextureImporterType.Sprite;
            ti.spriteImportMode = SpriteImportMode.Single;
            ti.spritePixelsPerUnit = source.pixelsPerUnit;
            ti.sRGBTexture = true;
            ti.mipmapEnabled = false;
            ti.npotScale = TextureImporterNPOTScale.None;
            ti.maxTextureSize = 16384;
            var settings = new TextureImporterSettings();
            ti.ReadTextureSettings(settings);
            settings.spriteAlignment = (int)SpriteAlignment.Custom;
            settings.spritePivot = new Vector2(source.pivot.x / source.rect.width,
                                               source.pivot.y / source.rect.height);
            ti.SetTextureSettings(settings);
            ti.alphaIsTransparency  = true;
            ti.textureCompression   = TextureImporterCompression.Uncompressed;
            ti.isReadable           = false;
            ti.SaveAndReimport();
        }
    }
}
