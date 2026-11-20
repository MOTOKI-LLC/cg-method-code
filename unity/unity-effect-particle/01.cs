using UnityEngine;
using UnityEngine.UI;

[RequireComponent(typeof(Text))]
public class TimeScript : MonoBehaviour
{
    [SerializeField] private float duration = 10f;
    private Text label;
    private float remaining;
    private int previousValue = -1;

    private void Awake() { label = GetComponent<Text>(); }

    private void OnEnable()
    {
        if (label == null) label = GetComponent<Text>();
        remaining = Mathf.Max(0f, duration);
        previousValue = -1;
        Refresh();
    }

    private void Update()
    {
        remaining = Mathf.Max(0f, remaining - Time.deltaTime);
        Refresh();
    }

    private void Refresh()
    {
        int value = Mathf.CeilToInt(remaining);
        if (label == null || value == previousValue) return;
        label.text = value.ToString();
        previousValue = value;
    }
}
