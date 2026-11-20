using System;
using System.IO;
using UnityEditor;
using UnityEngine;

public static class CgmScreenshotPath
{
    public static string Validate(string path)
    {
        if (string.IsNullOrWhiteSpace(path) || !Path.IsPathFullyQualified(path))
            throw new ArgumentException("An absolute PNG path is required.");
        string full = Path.GetFullPath(path);
        if (!string.Equals(Path.GetExtension(full), ".png", StringComparison.OrdinalIgnoreCase))
            throw new ArgumentException("Use the .png extension.");
        if (!Directory.Exists(Path.GetDirectoryName(full)))
            throw new DirectoryNotFoundException("Choose an existing output directory.");
        if (File.Exists(full) || Directory.Exists(full))
            throw new IOException("Choose a new output filename.");
        return full;
    }
}

// Assets/Editor/CgmCaptureGameView.cs
public static class CgmCaptureGameView
{
    [MenuItem("Tools/CG Method/Request Game View PNG")]
    private static void Capture()
    {
        if (!EditorApplication.isPlaying || EditorApplication.isPaused)
        { Debug.LogWarning("Run Play Mode, unpause, and render the Game view first."); return; }
        string path = EditorUtility.SaveFilePanel("New Game View PNG", "",
            DateTime.Now.ToString("yyyyMMdd-HHmmss-fff"), "png");
        if (string.IsNullOrEmpty(path)) return;
        try
        {
            path = CgmScreenshotPath.Validate(path);
            ScreenCapture.CaptureScreenshot(path, 1);
            Debug.Log("PNG capture requested. Check the file after rendering: " + path);
        }
        catch (Exception e) { Debug.LogException(e); }
    }
}
