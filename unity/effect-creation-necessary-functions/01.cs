using UnityEngine;

public class UVScroll : MonoBehaviour
{
    [SerializeField] private float scrollSpeedX = 0.1f;
    [SerializeField] private float scrollSpeedY = 0.1f;

    private Renderer targetRenderer;

    void Start()
    {
        targetRenderer = GetComponent<Renderer>();
        targetRenderer.sharedMaterial.SetTextureOffset("_MainTex", Vector2.zero);
    }

    void Update()
    {
        float x = Mathf.Repeat(Time.time * scrollSpeedX, 1);
        float y = Mathf.Repeat(Time.time * scrollSpeedY, 1);
        targetRenderer.sharedMaterial.SetTextureOffset("_MainTex", new Vector2(x, y));
    }
}
