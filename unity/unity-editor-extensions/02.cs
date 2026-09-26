using UnityEngine;

public class ExampleClass : MonoBehaviour
{
    void Start()
    {
        GameObject[] obstacles = GameObject.FindGameObjectsWithTag("Mask");
        foreach (GameObject obs in obstacles)
        {
            Renderer rend = obs.GetComponent<Renderer>();
            // シェーダー作成・アサイン
            rend.material = new Material(Shader.Find("Unlit/Color"));
            // カラーを変更
            rend.material.color = Color.red;
        }
    }
}
