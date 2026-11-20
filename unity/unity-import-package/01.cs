using UnityEditor;
using UnityEngine;

public static class MoveAssets
{
    [MenuItem("Sample/MoveAssetsToDirectory")]
    private static void Example()
    {
        const string source = "Assets/A/Sample.png";
        const string destination = "Assets/B/Sample.png";
        if (AssetDatabase.LoadMainAssetAtPath(source) == null ||
            !AssetDatabase.IsValidFolder("Assets/B"))
        {
            Debug.LogError("移動元または移動先フォルダーを確認してください。");
            return;
        }
        string error = AssetDatabase.ValidateMoveAsset(source, destination);
        if (!string.IsNullOrEmpty(error))
        {
            Debug.LogError(error);
            return;
        }
        error = AssetDatabase.MoveAsset(source, destination);
        if (!string.IsNullOrEmpty(error))
            Debug.LogError(error);
        else
            Debug.Log("移動しました: " + destination);
    }
}
