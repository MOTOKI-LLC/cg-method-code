using UnityEngine;
using UnityEngine.UI;

[RequireComponent(typeof(Text))]
public class TextUnicode : MonoBehaviour
{
    public string unicode = "f023";
    private Text textComponent;

    void OnEnable() { UpdateText(); }

    void UpdateText()
    {
        if (textComponent == null)
            textComponent = GetComponent<Text>();
        if (textComponent == null) return;

        string character;
        textComponent.text = TryConvert(unicode, out character) ? character : "";
    }

    public static bool TryConvert(string value, out string character)
    {
        character = "";
        int code;
        if (!int.TryParse((value ?? "").Trim(),
            System.Globalization.NumberStyles.HexNumber,
            System.Globalization.CultureInfo.InvariantCulture, out code)
            || code < 0 || code > 0x10FFFF
            || (code >= 0xD800 && code <= 0xDFFF))
            return false;

        character = char.ConvertFromUtf32(code);
        return true;
    }
}
