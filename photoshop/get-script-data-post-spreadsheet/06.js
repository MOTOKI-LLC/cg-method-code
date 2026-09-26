function getHttpResponse(requests) {
    var parseUrl = function(url) {
        var urlObj = {};
        //[url, scheme, slash, host, port, path, query, fragment] via O'REILLY JavaScript: The Good Parts  
        var url_re = /^(?:([A-Za-z]+):)?(\/{0,3})([0-9.\-A-Za-z]+)(?::(\d+))?(?:\/([^?#]*))?(?:\?([^#]*))?(?:#(.*))?$/;
        var m = url_re.exec(url);
        urlObj.host = m[3];
        urlObj.port = m[4] || '80';
        urlObj.path = m[5];
        urlObj.query = (m[6]) ? '?' + m[6] : '';
        urlObj.frag = (m[7]) ? '#' + m[7] : '';
        return urlObj;
    }
    var urlObj = parseUrl(requests.url);
    var encoding = requests.encoding || 'UTF-8';
    var method = requests.method || 'GET';
    var auth = (requests.basic_auth != undefined) ? 'Authorization: Basic ' + requests.basic_auth + '\r\n' : '';
    var conn = new Socket;
    conn.timeout = 10;
    if (conn.open(urlObj.host + ':' + urlObj.port, encoding)) {　　
        conn.write(method + ' /' + urlObj.path + urlObj.query + urlObj.frag + ' HTTP/1.0\r\n' + 'Host: ' + urlObj.host + '\r\n' + 'User-Agent: ' + 'InDesign/6.0' + '(Macintosh; U; Intel Mac OS X 10_5_6; ja-jp)' + '\r\n' + auth + '\r\n');
        var reply = conn.read(999999);
        conn.close();
        return reply; //ヘッダ込みで返す  
    } else {
        return conn.error;
    }
}

//Webからファイルをダウンロードする  
function downloadFile(url, localFile) {
    var rep = getHttpResponse({
        method: 'GET',
        url: url,
        encoding: 'BINARY',
    });
    if (rep.match(/HTTP.*\d{3}/).toString().indexOf('200') != -1) {
        //レスポンスのヘッダを除去   
        var body = rep.slice(rep.indexOf('\r\n\r\n') + 4);
        //ファイルに書き出し  
        var f = new File(localFile);
        if (f.open("w")) {
            f.encoding = 'BINARY';
            f.write(body);
        }
        f.close();
        return f;
    } else {
        return false;
    }
}

//ソースコードをダウンロード
//var f = downloadFile('https://www.cg-method.com/blog/', '~/Desktop/cg-method.txt');  

//スクリプトをダウンロード
//var f = downloadFile('https://www.cg-method.com/download/5652/', '~/Desktop/CGM_SavePng.jsx');  

//画像をダウンロード
var f = downloadFile('https://secure.gravatar.com/avatar/077a21e2303f1efa3d3a5ecbf5e5193d?s=100&d=mm&r=g', '~/Desktop/suimin.png');

if (f) {
    alert(f.name + 'を保存しました。');
}
