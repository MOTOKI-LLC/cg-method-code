using UnityEngine;
using UnityEngine.UI;
using Baum2;
namespace Baum2.Sample
{
public class uiTest : MonoBehaviour
{
[SerializeField]
private GameObject UIPrefab;
private UIRoot UI;
private int ListSize;
    public void Start()
    {
        UI = BaumUI.Instantiate(gameObject, UIPrefab);
        ListSize = 10;
        ListSample();
        SliderSample();
    }

    public void Update()
    {
        SliderSample();
    }

    public void ListSample()
    {
        var list = UI.Get<List>("List");
        list.Scrollbar = UI.Get<Scrollbar>("Scrollbar");
        list.Spacing = 10;
        list.UISelector = (int index) =>
        {
            return index % 2 == 0 ? "Item1" : "Item2";
        };
        list.UIFactory = (UIRoot ui, int index) =>
        {
            ui.gameObject.name = "ListItem" + index;
            var button = ui.Get<Button>("Button", true);
            if (button != null)
            {
                button.onClick.AddListener(() => Debug.Log(index));
            }
        };
        list.Resize(ListSize);
    }

    public void SliderSample()
    {
        UI.Get<Slider>("Slider").value = Mathf.Clamp01(Time.time % 1.0f);
    }
}
}
