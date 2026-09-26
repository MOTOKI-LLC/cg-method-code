app.bringToFront();
var parent = activeDocument;
parent.layers[0];
parent.suspendHistory("レイヤーに種類と不透明度を追記  ", "main()");

function main()
{
    var BLEND_MODE_NAMES = {
        'NORMAL': '通常',
        'COLORBLEND': 'カラー',
        'COLORBURN': '焼き込みカラー',
        'COLORDODGE': '覆焼きカラー',
        'DARKEN': '比較（暗）',
        'DIFFERENCE': '差の絶対値',
        'DISSOLVE': 'ディザ合成',
        'DIVIDE': '除算',
        'EXCLUSION': '除外',
        'HARDLIGHT': 'ハード ライト',
        'HARDMIX': 'ハードミックス',
        'HUE': '色相',
        'LIGHTEN': '比較（明）',
        'LINEARBURN': '焼き込み（リニア）',
        'LINEARDODGE': '覆焼き（リニア）加算',
        'LINEARLIGHT': 'リニアライト',
        'LUMINOSITY': '輝度',
        'MULTIPLY': '乗算',
        'OVERLAY': 'オーバーレイ',
        'PASSTHROUGH': '', //通過
        'PINLIGHT': 'ピンライト',
        'SATURATION': '彩度',
        'SCREEN': 'スクリーン',
        'SOFTLIGHT': 'ソフトライト',
        'SUBTRACT': '減算',
        'VIVIDLIGHT': 'ビビッドライト',
        'DARKERCOLOR': 'カラー比較（暗）',
        'LIGHTERCOLOR': 'カラー比較（明）'
    };

    var LAYER_KIND_NAMES = {
        'BLACKANDWHITE': '白黒',
        'BRIGHTNESSCONTRAST': '明るさコントラスト',
        'CHANNELMIXER': 'チャンネルミキサー',
        'COLORBALANCE': 'カラーバランス',
        'CURVES': 'トーンカーブ',
        'EXPOSURE': '露光量',
        'GRADIENTFILL': 'グラデーション（塗りつぶしレイヤー）',
        'GRADIENTMAP': 'グラデーションマップ',
        'HUESATURATION': '色相・彩度',
        'INVERSION': '階調の反転',
        'LEVELS': 'レベル補正',
        'NORMAL': '',
        'PATTERNFILL': 'パターン（塗りつぶしレイヤー）',
        'PHOTOFILTER': 'フィルター',
        'POSTERIZE': 'ポスタライズ',
        'SELECTIVECOLOR': '特定色域の選択',
        'SMARTOBJECT': 'スマートオブジェクト',
        'SOLIDFILL': 'べた塗り（塗りつぶしレイヤー）',
        'TEXT': 'テキストレイヤー',
        'THRESHOLD': 'しきい値',
        'LAYER3D': '3Dレイヤー',
        'VIBRANCE': '自然な彩度',
        'VIDEO': 'ビデオレイヤー',
    };

    function getBlendModeInJa(blendMode)
    {
        blendMode = '' + blendMode;
        var index = blendMode.indexOf('BlendMode.');
        if (index >= 0)
        {
            blendMode = blendMode.substr(index + 1 + 9);
            if (BLEND_MODE_NAMES[blendMode] !== void 0)
            {
                blendMode = BLEND_MODE_NAMES[blendMode];
            }
        }
        return blendMode;
    }

    function geLayerKindInJa(layerKind)
    {
        layerKind = '' + layerKind;
        var index = layerKind.indexOf('LayerKind.');
        if (index >= 0)
        {
            layerKind = layerKind.substr(index + 1 + 9);
            if (LAYER_KIND_NAMES[layerKind] !== void 0)
            {
                layerKind = LAYER_KIND_NAMES[layerKind];
            }
        }
        return layerKind;
    }

    function removeArtlayerNameInfo(parent)
    {
        var ChildLyaers = parent.layers;
        for (var i = 0; i < ChildLyaers.length; i++)
        {


            if (ChildLyaers[i].typename == "LayerSet")
            {

                removeArtlayerNameInfo(ChildLyaers[i]);
            }

            var artLayer = ChildLyaers[i];
            var name = artLayer.name;
            var index = name.indexOf(' : ');
            if (index >= 0)
            {
                name = name.substr(0, index);
                var visible = artLayer.visible;
                artLayer.name = name;
                artLayer.visible = visible;
            }
        }
    }

    function addArtlayerNameInfo(parent)
    {
        var ChildLyaers = parent.layers;

        for (var i = 0; i < ChildLyaers.length; i++)
        {
            if (ChildLyaers[i].typename === "LayerSet")
            {
                addArtlayerNameInfo(ChildLyaers[i]);
            }

            var artLayer = ChildLyaers[i];
            var name = artLayer.name;
            var index = name.indexOf(' : ');
            var layerKind = artLayer.kind;
            layerKind = !true ? geLayerKindInJa(layerKind) : '';
            if (layerKind !== '')
            {
                layerKind = '[' + layerKind + ']';
            }
            var layerOpacity = Math.round(artLayer.opacity);
            if (layerOpacity === 100)
            {
                layerOpacity = '';
            } else
            {
                layerOpacity = layerOpacity + '%';
            }
            var blendMode = artLayer.blendMode;
            blendMode = getBlendModeInJa(blendMode);

            temp = [];
            if (blendMode !== '')
            {
                temp.push(blendMode);
            }
            if (layerOpacity !== '')
            {
                temp.push(layerOpacity);
            }
            if (layerKind !== '')
            {
                temp.push(layerKind);
            }
            if (temp.length > 0)
            {
                temp = temp.join(' ');
                newName = name + ' : ' + temp;
                var visible = artLayer.visible;
                artLayer.name = newName;
                artLayer.visible = visible;
            }
        }
    }

    removeArtlayerNameInfo(parent);
    addArtlayerNameInfo(parent);
}
