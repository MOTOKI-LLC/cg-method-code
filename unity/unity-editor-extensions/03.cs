using System;
using UnityEditor;
using UnityEngine;

// Also requires CgmSceneSelection from CgmRemoveOutline.cs.
public class CgmAssignMaterial : EditorWindow
{
    private Material material;

    [MenuItem("Tools/CG Method/Assign First Renderer Material")]
    private static void Open() { GetWindow<CgmAssignMaterial>("Assign Material"); }

    private void OnGUI()
    {
        EditorGUILayout.HelpBox("Select ordinary Scene objects. Only material slot 0 changes.", MessageType.Info);
        material = (Material)EditorGUILayout.ObjectField("Material Asset", material, typeof(Material), false);
        if (GUILayout.Button("Assign To Selected Renderers")) Assign();
    }

    private void Assign()
    {
        try
        {
            if (material == null || !EditorUtility.IsPersistent(material))
                throw new InvalidOperationException("Choose a saved Material asset.");
            GameObject[] objects = CgmSceneSelection.Get();
            foreach (GameObject obj in objects)
            {
                Renderer renderer = obj.GetComponent<Renderer>();
                if (renderer == null || renderer.sharedMaterials.Length == 0)
                    throw new InvalidOperationException("Renderer with a material slot is required: " + obj.name);
            }
            CgmSceneSelection.Change("Assign Material", () =>
            {
                foreach (GameObject obj in objects)
                {
                    Renderer renderer = obj.GetComponent<Renderer>();
                    Undo.RecordObject(renderer, "Assign Material");
                    Material[] slots = renderer.sharedMaterials;
                    slots[0] = material;
                    renderer.sharedMaterials = slots;
                }
            });
            Debug.Log("Updated Renderer slot 0: " + objects.Length);
        }
        catch (Exception e) { Debug.LogException(e); }
    }
}
