using UnityEngine;

public class Billboard : MonoBehaviour
{
    public Camera targetCamera;

    void Start()
    {
        if (targetCamera == null)
            targetCamera = Camera.main;
    }

    void Update()
    {
        transform.LookAt(targetCamera.transform.position);
        transform.Rotate(90, 0, 0); // Plane用の補正
    }
}
