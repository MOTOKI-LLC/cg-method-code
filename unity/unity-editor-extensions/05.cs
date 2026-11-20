using System;
using System.Linq;
using UnityEditor;
using UnityEngine;
using UnityEngine.SceneManagement;

// Also requires CgmSceneSelection from CgmRemoveOutline.cs.
public static class CgmGroupSelected
{
    [MenuItem("Tools/CG Method/Group Selected Siblings")]
    private static void Group()
    {
        try
        {
            GameObject[] objects = CgmSceneSelection.Get();
            Transform[] selected = objects.Select(o => o.transform).OrderBy(t => t.GetSiblingIndex()).ToArray();
            Transform parent = selected[0].parent;
            Scene scene = selected[0].gameObject.scene;
            foreach (Transform t in selected)
            {
                if (t is RectTransform || t.parent != parent || t.gameObject.scene != scene)
                    throw new InvalidOperationException("Select non-UI siblings in the same Scene.");
            }
            for (Transform t = parent; t != null; t = t.parent)
                if (t.localScale != Vector3.one)
                    throw new InvalidOperationException("Scaled ancestors are outside this example's scope.");
            int firstIndex = selected[0].GetSiblingIndex();
            CgmSceneSelection.Change("Group Selected Siblings", () =>
            {
                GameObject group = new GameObject("Group");
                SceneManager.MoveGameObjectToScene(group, scene);
                Undo.RegisterCreatedObjectUndo(group, "Group Selected Siblings");
                Undo.SetTransformParent(group.transform, parent, "Group Selected Siblings");
                Undo.RegisterCompleteObjectUndo(group.transform, "Group Selected Siblings");
                group.transform.localPosition = Vector3.zero;
                group.transform.localRotation = Quaternion.identity;
                group.transform.localScale = Vector3.one;
                Undo.SetSiblingIndex(group.transform, firstIndex, "Group Selected Siblings");
                for (int i = 0; i < selected.Length; i++)
                {
                    Undo.SetTransformParent(selected[i], group.transform, "Group Selected Siblings");
                    Undo.SetSiblingIndex(selected[i], i, "Group Selected Siblings");
                }
                Selection.activeGameObject = group;
            });
        }
        catch (Exception e) { Debug.LogException(e); }
    }
}
