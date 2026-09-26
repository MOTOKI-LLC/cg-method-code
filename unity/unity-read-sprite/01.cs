using UnityEngine;
using UnityEngine.UI;

public class ChangeSprite : MonoBehaviour
{
    [SerializeField] private Sprite newSprite;
    
    void Start()
    {
        GetComponent<Image>().sprite = newSprite;
    }
}
