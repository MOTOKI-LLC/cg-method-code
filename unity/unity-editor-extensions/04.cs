using UnityEngine;
using UnityEditor;
using System.Linq;

public class CreateEmptyParent : Editor
{
    [MenuItem("Edit/Group Selected %g")]
    static void Group()
    {
        if (Selection.transforms.Length == 0) return;

        var sorted = Selection.transforms
            .OrderBy(t => t.GetSiblingIndex())
            .ToArray();

        GameObject group = new GameObject("Group");
        Undo.RegisterCreatedObjectUndo(group, "Group Selected");

        group.transform.SetParent(sorted[0].parent);
        group.transform.SetSiblingIndex(sorted[0].GetSiblingIndex());

        foreach (Transform t in sorted)
        {
            Undo.SetTransformParent(t, group.transform, "Group Selected");
        }
    }
}
