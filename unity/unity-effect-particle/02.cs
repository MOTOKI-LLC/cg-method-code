using UnityEngine;
public class FX_Test : MonoBehaviour
{
private ParticleSystem.CollisionEvent[] collisionEvents = new ParticleSystem.CollisionEvent[16];
private ParticleSystem ps;
void Start()
{
    ps = GetComponent<ParticleSystem>();
}

void Update()
{
    if (Input.GetMouseButtonDown(0))
    {
        ps.Play();
    }
}

void OnParticleCollision(GameObject other)
{
    GameObject hitParticle = GameObject.Find("Explosion");
    int safeLength = ps.GetSafeCollisionEventSize();
    
    if (collisionEvents.Length < safeLength)
        collisionEvents = new ParticleSystem.CollisionEvent[safeLength];
    
    int numCollisionEvents = ps.GetCollisionEvents(other, collisionEvents);
    
    for (int i = 0; i < numCollisionEvents; i++)
    {
        Vector3 collisionHitLoc = collisionEvents[i].intersection;
        GameObject instance = Instantiate(hitParticle, collisionHitLoc, Quaternion.identity);
        instance.GetComponent<ParticleSystem>().Play();
        Destroy(instance, 1.0f);
    }
}
}
