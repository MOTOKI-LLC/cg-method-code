using UnityEngine;
using UnityEditor;
public class MoveAssets : MonoBehaviour
{
[MenuItem("Sample/MoveAssetsToDirectory")]
private static void Example()
{
AssetDatabase.MoveAsset("Assets/A/Sample.png", "Assets/B/Sample.png");
}
}
