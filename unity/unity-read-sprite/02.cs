using UnityEngine;
using UnityEngine.UI;

public class LoadSpriteFromResources : MonoBehaviour
{
    void Start()
    {
        Sprite loadedSprite = Resources.Load<Sprite>("profile");
        GetComponent<Image>().sprite = loadedSprite;
    }
}
