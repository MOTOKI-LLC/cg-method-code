using UnityEngine;
using UnityEngine.UI;
public class TimeScript : MonoBehaviour
{
private float time = 10;
void Start()
{
    GetComponent<Text>().text = ((int)time).ToString();
}

void Update()
{
    time -= Time.deltaTime;
    if (time < 0) time = 0;
    GetComponent<Text>().text = ((int)time).ToString();
}
}
