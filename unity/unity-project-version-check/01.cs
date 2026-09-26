using UnityEngine;

public class VersionLogger : MonoBehaviour
{
    void Start()
    {
        Debug.Log("Unity: " + Application.unityVersion);
    }
}
