using UnityEngine;
using UnityEngine.UI;

[ExecuteInEditMode]
public class TextUnicode : MonoBehaviour
{
    public string unicode;
    private Text textComponent;

    void Start()
    {
        textComponent = GetComponent<Text>();
        UpdateText();
    }

    void OnValidate()
    {
        if (textComponent == null)
            textComponent = GetComponent<Text>();
        UpdateText();
    }

    void UpdateText()
    {
        if (textComponent != null && !string.IsNullOrEmpty(unicode))
        {
            int code = int.Parse(unicode, System.Globalization.NumberStyles.HexNumber);
            textComponent.text = char.ConvertFromUtf32(code);
        }
    }
}
