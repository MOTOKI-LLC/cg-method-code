using UnityEngine;

public class GameController : MonoBehaviour
{
    public GameObject GoalText;
    private bool cleared;

    void Awake()
    {
        if (GoalText == null)
        {
            Debug.LogWarning("Goal TextにUIを割り当ててください。", this);
            enabled = false;
            return;
        }
        GoalText.SetActive(false);
    }

    private void OnTriggerEnter(Collider other)
    {
        if (!isActiveAndEnabled || cleared || GoalText == null) return;
        Rigidbody body = other.attachedRigidbody;
        bool isPlayer = other.CompareTag("Player")
            || (body != null && body.CompareTag("Player"));
        if (!isPlayer) return;

        cleared = true;
        GoalText.SetActive(true);
    }
}
