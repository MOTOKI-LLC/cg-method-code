using UnityEngine;

public class Rotator : MonoBehaviour
{
    [SerializeField]
    private Vector3 angle;

    void Update()
    {
        transform.Rotate(angle * Time.deltaTime);
    }
}
