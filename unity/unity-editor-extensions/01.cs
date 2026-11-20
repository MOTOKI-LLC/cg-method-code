using UnityEditor;
using UnityEngine;

public class MyFirstWindow : EditorWindow
{
    [MenuItem("Tools/My First Window")]
    public static void ShowWindow()
    {
        MyFirstWindow window = GetWindow<MyFirstWindow>();
        window.titleContent = new GUIContent("My First Window");
    }

    private void OnGUI()
    {
        GUILayout.Label("はじめてのエディタ拡張");
        if (GUILayout.Button("選択数をConsoleに出す"))
        {
            Debug.Log("選択中のGameObject：" + Selection.gameObjects.Length + "個");
        }
    }
}
