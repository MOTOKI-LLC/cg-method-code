using UnityEngine;

public class Billboard : MonoBehaviour
{
    [SerializeField] private Camera targetCamera;
    [SerializeField] private Vector3 localEulerOffset = Vector3.zero;

    private void LateUpdate()
    {
        if (targetCamera == null) targetCamera = Camera.main;
        if (targetCamera == null) return;

        Vector3 direction = targetCamera.orthographic
            ? targetCamera.transform.forward
            : transform.position - targetCamera.transform.position;
        if (direction.sqrMagnitude < 0.000001f) return;

        transform.rotation = Quaternion.LookRotation(direction, targetCamera.transform.up)
            * Quaternion.Euler(localEulerOffset);
    }
}
