using UnityEngine;
using UnityEngine.Pool;

public class Bullet : MonoBehaviour
{
    [SerializeField] float speed = 10f;
    [SerializeField] float lifeTime = 2f;

    IObjectPool<Bullet> pool;
    float timer;

    // どのプールに返すかを、作ったときに受け取る
    public void SetPool(IObjectPool<Bullet> owner)
    {
        pool = owner;
    }

    // 取り出すたびに、位置と経過時間を初めの状態に戻す
    public void ResetState(Vector3 position, Quaternion rotation)
    {
        transform.SetPositionAndRotation(position, rotation);
        timer = 0f;
    }

    void Update()
    {
        transform.Translate(Vector3.forward * speed * Time.deltaTime);
        timer += Time.deltaTime;
        if (timer >= lifeTime)
        {
            pool.Release(this); // Destroyの代わりにプールへ返す
        }
    }
}
