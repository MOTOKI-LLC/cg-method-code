using UnityEngine;
using UnityEngine.Pool;

public class BulletSpawner : MonoBehaviour
{
    [SerializeField] Bullet bulletPrefab;
    [SerializeField] float interval = 0.2f;

    ObjectPool<Bullet> pool;
    float nextTime;

    void Awake()
    {
        pool = new ObjectPool<Bullet>(
            createFunc: () =>
            {
                var bullet = Instantiate(bulletPrefab);
                bullet.SetPool(pool);
                return bullet;
            },
            actionOnGet: bullet => bullet.gameObject.SetActive(true),
            actionOnRelease: bullet => bullet.gameObject.SetActive(false),
            actionOnDestroy: bullet => Destroy(bullet.gameObject),
            collectionCheck: true,
            defaultCapacity: 20,
            maxSize: 100);
    }

    void Update()
    {
        if (Time.time < nextTime) return;
        nextTime = Time.time + interval;

        var bullet = pool.Get();
        bullet.ResetState(transform.position, transform.rotation);
    }
}
