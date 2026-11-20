using UnityEngine;
using UnityEngine.UI;

[RequireComponent(typeof(Image))]
public class LoadSpriteFromResources : MonoBehaviour
{
    [SerializeField] private string resourcePath = "profile";

    void Start()
    {
        Image target = GetComponent<Image>();
        if (target == null || string.IsNullOrWhiteSpace(resourcePath))
        {
            Debug.LogWarning("ImageとResource Pathを確認してください。", this);
            return;
        }

        Sprite loadedSprite = Resources.Load<Sprite>(resourcePath);
        if (loadedSprite == null)
        {
            Debug.LogWarning("Resources内のパスとSpriteの型を確認してください。", this);
            return;
        }
        target.sprite = loadedSprite;
    }
}
