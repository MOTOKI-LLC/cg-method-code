using UnityEngine;
using UnityEngine.UI;
using UnityEngine.Networking;
using System.Collections;

public class GetNetworkImage : MonoBehaviour
{
    [SerializeField] private string url = "https://example.com/image.png";
    
    private RawImage rawImage;

    IEnumerator Start()
    {
        rawImage = GetComponent<RawImage>();
        
        using (UnityWebRequest request = UnityWebRequestTexture.GetTexture(url))
        {
            yield return request.SendWebRequest();
            
            if (request.result == UnityWebRequest.Result.Success)
            {
                Texture2D texture = DownloadHandlerTexture.GetContent(request);
                rawImage.texture = texture;
                rawImage.SetNativeSize(); // 画像の元サイズで表示
            }
            else
            {
                Debug.LogError("画像の取得に失敗: " + request.error);
            }
        }
    }
}
