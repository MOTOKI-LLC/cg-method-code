using System;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.UI;

// Assets/Editor/CgmRemoveOutline.cs
public static class CgmSceneSelection
{
    public static GameObject[] Get()
    {
        if (EditorApplication.isPlayingOrWillChangePlaymode)
            throw new InvalidOperationException("Exit Play Mode first.");
        GameObject[] objects = Selection.gameObjects;
        if (objects.Length == 0)
            throw new InvalidOperationException("Select Scene GameObjects in Hierarchy.");
        var stage = PrefabStageUtility.GetCurrentPrefabStage();
        foreach (GameObject obj in objects)
        {
            if (EditorUtility.IsPersistent(obj) || !obj.scene.IsValid() || !obj.scene.isLoaded ||
                EditorSceneManager.IsPreviewSceneObject(obj) ||
                (stage != null && obj.scene == stage.scene) || PrefabUtility.IsPartOfAnyPrefab(obj))
                throw new InvalidOperationException("Only ordinary Scene objects are supported: " + obj.name);
        }
        return objects;
    }

    public static void Change(string name, Action action)
    {
        Undo.IncrementCurrentGroup();
        int group = Undo.GetCurrentGroup();
        Undo.SetCurrentGroupName(name);
        try
        {
            action();
            Undo.FlushUndoRecordObjects();
            Undo.CollapseUndoOperations(group);
        }
        catch
        {
            Undo.FlushUndoRecordObjects();
            Undo.RevertAllDownToGroup(group);
            throw;
        }
    }
}

public static class CgmRemoveOutline
{
    [MenuItem("Tools/CG Method/Remove Selected UI Outlines")]
    private static void Remove()
    {
        try
        {
            GameObject[] objects = CgmSceneSelection.Get();
            int removed = 0;
            CgmSceneSelection.Change("Remove UI Outlines", () =>
            {
                foreach (GameObject obj in objects)
                    foreach (Outline outline in obj.GetComponents<Outline>())
                    { Undo.DestroyObjectImmediate(outline); removed++; }
            });
            Debug.Log("Removed UI Outline components: " + removed);
        }
        catch (Exception e) { Debug.LogException(e); }
    }
}
