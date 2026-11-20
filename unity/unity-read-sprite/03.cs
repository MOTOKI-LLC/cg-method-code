using System;
using System.Collections;
using UnityEngine;
using UnityEngine.Networking;
using UnityEngine.UI;

[RequireComponent(typeof(RawImage))]
public class GetNetworkImage : MonoBehaviour
{
    [SerializeField] private string url = "";
    [SerializeField] private bool useNativeSize = false;
    private RawImage target;
    private UnityWebRequest activeRequest;
    private Texture2D ownedTexture;

    void Awake() { target = GetComponent<RawImage>(); }
    void OnEnable() { StartCoroutine(Load()); }

    IEnumerator Load()
    {
        Uri uri;
        if (target == null || !Uri.TryCreate(url, UriKind.Absolute, out uri)
            || uri.Scheme != Uri.UriSchemeHttps)
        {
            Debug.LogWarning("RawImageとHTTPS画像URLを確認してください。", this);
            yield break;
        }

        activeRequest = UnityWebRequestTexture.GetTexture(uri.AbsoluteUri, true);
        activeRequest.timeout = 15;
        try
        {
            yield return activeRequest.SendWebRequest();
            if (activeRequest.result != UnityWebRequest.Result.Success)
            {
                Debug.LogWarning("画像取得に失敗。HTTP="
                    + activeRequest.responseCode + " / " + activeRequest.error, this);
                yield break;
            }

            ownedTexture = DownloadHandlerTexture.GetContent(activeRequest);
            if (ownedTexture == null) yield break;
            if (target == null)
            {
                Destroy(ownedTexture);
                ownedTexture = null;
                yield break;
            }
            target.texture = ownedTexture;
            if (useNativeSize) target.SetNativeSize();
        }
        finally { ReleaseRequest(); }
    }

    void ReleaseRequest()
    {
        if (activeRequest == null) return;
        if (!activeRequest.isDone) activeRequest.Abort();
        activeRequest.Dispose();
        activeRequest = null;
    }

    void OnDisable()
    {
        StopAllCoroutines();
        ReleaseRequest();
        if (ownedTexture == null) return;
        if (target != null && target.texture == ownedTexture) target.texture = null;
        Destroy(ownedTexture);
        ownedTexture = null;
    }
}
