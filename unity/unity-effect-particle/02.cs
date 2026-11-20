using UnityEngine;
using System.Collections;
using System.Collections.Generic;

[RequireComponent(typeof(ParticleSystem))]
public class FX_Test : MonoBehaviour
{
    [SerializeField] private ParticleSystem hitEffectPrefab;
    [SerializeField, Min(1)] private int maxHitsPerCallback = 4;
    [SerializeField, Min(1)] private int maxLiveHits = 32;
    [SerializeField, Min(0.1f)] private float cleanupTimeout = 10f;
    private ParticleSystem source;
    private readonly List<ParticleCollisionEvent> collisionEvents = new List<ParticleCollisionEvent>(16);
    private readonly List<ParticleSystem> liveHits = new List<ParticleSystem>();

    private void Awake() { source = GetComponent<ParticleSystem>(); }

    public void PlayBeam()
    {
        if (source != null && isActiveAndEnabled) source.Play(true);
    }

    private void OnParticleCollision(GameObject other)
    {
        if (!isActiveAndEnabled || source == null || other == null
            || hitEffectPrefab == null || hitEffectPrefab == source) return;

        liveHits.RemoveAll(item => item == null);
        int count = source.GetCollisionEvents(other, collisionEvents);
        int spawnCount = Mathf.Min(count, Mathf.Max(1, maxHitsPerCallback));
        for (int i = 0; i < spawnCount && liveHits.Count < Mathf.Max(1, maxLiveHits); i++)
        {
            ParticleSystem hit = Instantiate(hitEffectPrefab, collisionEvents[i].intersection, Quaternion.identity);
            hit.gameObject.SetActive(true);
            hit.Stop(true, ParticleSystemStopBehavior.StopEmittingAndClear);
            hit.Play(true);
            liveHits.Add(hit);
            StartCoroutine(ReleaseAfterPlayback(hit));
        }
    }

    private IEnumerator ReleaseAfterPlayback(ParticleSystem hit)
    {
        double deadline = Time.realtimeSinceStartupAsDouble + Mathf.Max(0.1f, cleanupTimeout);
        yield return null;
        while (hit != null && hit.IsAlive(true) && Time.realtimeSinceStartupAsDouble < deadline)
            yield return null;
        if (hit != null)
        {
            liveHits.Remove(hit);
            Destroy(hit.gameObject);
        }
    }

    private void OnDisable()
    {
        StopAllCoroutines();
        foreach (ParticleSystem hit in liveHits)
            if (hit != null) Destroy(hit.gameObject);
        liveHits.Clear();
    }
}
