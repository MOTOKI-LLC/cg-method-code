using UnityEngine;

public class UVScroll : MonoBehaviour
{
    [SerializeField] private string textureProperty = "_BaseMap";
    [SerializeField] private Vector2 speed = new Vector2(0.1f, 0.1f);
    private Renderer targetRenderer;
    private Material originalMaterial;
    private Material ownedMaterial;
    private Vector2 initialOffset;
    private Vector2 movement;

    private void OnEnable()
    {
        targetRenderer = GetComponent<Renderer>();
        if (targetRenderer == null || targetRenderer.sharedMaterial == null)
        {
            Debug.LogWarning("RendererとMaterialを設定してください。", this);
            enabled = false;
            return;
        }
        originalMaterial = targetRenderer.sharedMaterial;
        ownedMaterial = new Material(originalMaterial);
        if (string.IsNullOrEmpty(textureProperty) || !ownedMaterial.HasProperty(textureProperty))
        {
            Debug.LogWarning("ShaderのTextureプロパティ名を確認してください。", this);
            Destroy(ownedMaterial);
            ownedMaterial = null;
            enabled = false;
            return;
        }
        initialOffset = ownedMaterial.GetTextureOffset(textureProperty);
        movement = Vector2.zero;
        targetRenderer.sharedMaterial = ownedMaterial;
    }

    private void Update()
    {
        if (ownedMaterial == null) return;
        movement += speed * Time.deltaTime;
        movement.x = Mathf.Repeat(movement.x, 1f);
        movement.y = Mathf.Repeat(movement.y, 1f);
        ownedMaterial.SetTextureOffset(textureProperty, initialOffset + movement);
    }

    private void OnDisable() { ReleaseMaterial(); }
    private void OnDestroy() { ReleaseMaterial(); }

    private void ReleaseMaterial()
    {
        if (ownedMaterial == null) return;
        if (targetRenderer != null && targetRenderer.sharedMaterial == ownedMaterial)
            targetRenderer.sharedMaterial = originalMaterial;
        Destroy(ownedMaterial);
        ownedMaterial = null;
    }
}
