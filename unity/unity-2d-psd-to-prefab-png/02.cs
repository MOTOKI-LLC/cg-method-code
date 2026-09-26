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
            string dir        = Path.Combine(prefabRoot, Path.GetFileNameWithoutExtension(psdPath));
            Directory.CreateDirectory(dir);

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

            // ---------- ④ PNG 書き出し＆置換 ----------
            foreach (var sr in instance.GetComponentsInChildren<SpriteRenderer>(true))
            {
                if (sr.sprite == null) continue;
                var sprite = sr.sprite;

                // ④‑A: PNG 出力
                string pngPath = Path.Combine(dir, $"{sprite.name}.png");
                SaveSpriteAsPng(sprite, pngPath);

                // ④‑B: インポート設定を Sprite に
                SetPngAsSprite(pngPath);

                // ④‑C: SpriteRenderer が参照先を差し替え
                sr.sprite = AssetDatabase.LoadAssetAtPath<Sprite>(pngPath);
            }

            // ---------- ⑤ Prefab 保存 ----------
            string prefabPath = Path.Combine(dir, $"{rootGo.name}.prefab");
            PrefabUtility.SaveAsPrefabAsset(instance, prefabPath);

            // ---------- ⑥ 後片付け ----------
            Object.DestroyImmediate(instance);
            AssetDatabase.Refresh();

            Debug.Log($"{psd.name} 変換完了 → {prefabPath}");
        }
    }

    // .psd が選択されていないとメニューを非表示
    [MenuItem("Assets/BG/PSD → Prefab＋PNG (階層保持)", true)]
    private static bool Validate() =>
        Selection.objects.Any(o => Path.GetExtension(AssetDatabase.GetAssetPath(o)).ToLower() == ".psd");

    // ---------- Utility ----------

    /// <summary>Sprite 部分だけ切り取って PNG 書き出し</summary>
    private static void SaveSpriteAsPng(Sprite sprite, string pngPath)
    {
        int w = (int)sprite.rect.width;
        int h = (int)sprite.rect.height;
        int x = (int)sprite.rect.x;
        int y = (int)sprite.rect.y;

        // 圧縮フォーマットでも確実に取れる RenderTexture → ReadPixels 方式
        var rt = RenderTexture.GetTemporary(sprite.texture.width,
                                            sprite.texture.height,
                                            0, RenderTextureFormat.ARGB32,
                                            RenderTextureReadWrite.Linear);

        Graphics.Blit(sprite.texture, rt);

        var prev = RenderTexture.active;
        RenderTexture.active = rt;

        var tex = new Texture2D(w, h, TextureFormat.RGBA32, false);
        tex.ReadPixels(new Rect(x, y, w, h), 0, 0);
        tex.Apply();

        RenderTexture.active = prev;
        RenderTexture.ReleaseTemporary(rt);

        File.WriteAllBytes(pngPath, ImageConversion.EncodeToPNG(tex));
    }

    /// <summary>PNG を Sprite として再インポート</summary>
    private static void SetPngAsSprite(string path)
    {
        AssetDatabase.ImportAsset(path);
        if (AssetImporter.GetAtPath(path) is TextureImporter ti)
        {
            ti.textureType          = TextureImporterType.Sprite;
            ti.spritePixelsPerUnit  = 100;
            ti.alphaIsTransparency  = true;
            ti.textureCompression   = TextureImporterCompression.Uncompressed;
            ti.isReadable           = false;
            ti.SaveAndReimport();
        }
    }
}
