using System;
using System.IO;
using System.Text;
using UnityEngine;

// Save as Assets/Editor/BatchHelloWriter.cs. Synchronous Windows example.
public static class BatchHelloWriter
{
    public static void Run()
    {
        Execute(false);
    }

    public static void VerifyOutput()
    {
        Execute(true);
    }

    private static void Execute(bool verify)
    {
        try
        {
            if (!Application.isBatchMode)
                throw new InvalidOperationException("This entry point requires -batchmode.");
            string path = BatchHelloFiles.ParseOutput(Environment.GetCommandLineArgs());
            if (verify)
                BatchHelloFiles.Verify(path);
            else
                BatchHelloFiles.WriteNew(path);
            Debug.Log((verify ? "HELLO_VERIFY_OK: " : "HELLO_WRITE_OK: ") + path);
        }
        catch (Exception error)
        {
            Debug.LogError("HELLO_FAILED: " + error);
            // The executeMethod caller receives the exception. Do not swallow it.
            throw;
        }
    }
}

// No Unity APIs: these exact helpers can be tested separately on Windows .NET.
public static class BatchHelloFiles
{
    public const string Text = "Hello from Unity batch mode!";

    public static string ParseOutput(string[] args)
    {
        if (args == null) throw new ArgumentNullException("args");
        string value = null;
        for (int i = 0; i < args.Length; i++)
        {
            if (args[i] != "-helloOutput") continue;
            if (value != null) throw new ArgumentException("Duplicate -helloOutput.");
            if (i + 1 >= args.Length || String.IsNullOrWhiteSpace(args[i + 1]) || args[i + 1].StartsWith("-"))
                throw new ArgumentException("-helloOutput needs an absolute file path.");
            value = args[++i];
        }
        if (value == null) throw new ArgumentException("Missing -helloOutput.");
        return ValidatePath(value);
    }

    public static string ValidatePath(string path)
    {
        // Limit this example to local drive paths; no relative, drive-relative or UNC paths.
        if (String.IsNullOrWhiteSpace(path) || path.Length < 4 ||
            !((path[0] >= 'A' && path[0] <= 'Z') || (path[0] >= 'a' && path[0] <= 'z')) ||
            path[1] != ':' || (path[2] != '\\' && path[2] != '/'))
            throw new ArgumentException("Use a local drive absolute file path, such as C:\\UnityBatch\\run01\\hello.txt.");
        if (path.IndexOf(':', 2) >= 0 || path.EndsWith("\\") || path.EndsWith("/"))
            throw new ArgumentException("A regular file path is required.");
        string full = Path.GetFullPath(path);
        string parent = Path.GetDirectoryName(full);
        if (String.IsNullOrEmpty(Path.GetFileName(full)) || !Directory.Exists(parent))
            throw new DirectoryNotFoundException("Create the output directory before starting Unity.");
        return full;
    }

    public static void WriteNew(string path)
    {
        path = ValidatePath(path);
        byte[] bytes = new UTF8Encoding(false, true).GetBytes(Text);
        // CreateNew refuses to replace an existing file. A failed write can leave a partial file.
        using (var stream = new FileStream(path, FileMode.CreateNew, FileAccess.Write, FileShare.None))
            stream.Write(bytes, 0, bytes.Length);
    }

    public static void Verify(string path)
    {
        path = ValidatePath(path);
        byte[] expected = new UTF8Encoding(false, true).GetBytes(Text);
        byte[] actual = File.ReadAllBytes(path);
        if (actual.Length != expected.Length)
            throw new InvalidDataException("Unexpected output length.");
        for (int i = 0; i < expected.Length; i++)
            if (actual[i] != expected[i]) throw new InvalidDataException("Unexpected output bytes.");
    }
}
