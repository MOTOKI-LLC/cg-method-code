using UnityEngine;
using UnityEditor;

public class RemoveComponent : Editor
{
    [MenuItem("Tools/Remove NewBehaviourScript")]
    static void Remove()
    {
        foreach (GameObject obj in Selection.gameObjects)
        {
            var component = obj.GetComponent<NewBehaviourScript>();
            if (component != null)
            {
                DestroyImmediate(component);
            }
        }
    }
}
