using UnityEngine;
using UnityEngine.UI;

[RequireComponent(typeof(Image))]
public class ChangeSprite : MonoBehaviour
{
    [SerializeField] private Sprite newSprite;

    void Start()
    {
        Image target = GetComponent<Image>();
        if (target == null || newSprite == null)
        {
            Debug.LogWarning("ImageまたはNew Spriteを確認してください。", this);
            return;
        }
        target.sprite = newSprite;
    }
}
