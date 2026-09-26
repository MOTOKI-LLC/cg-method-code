//[MaterialToggle] _MaskOn ("Mask On", Float) = 0
//_Color ("Tint", Color) = (1,1,1,1)
//[MaterialToggle] PixelSnap ("Pixel snap", Float) = 0
//fixed4 _Color;
OUT.color = IN.color; //* _Color;
fixed4 m = lerp(c, _MaskColor, 1);
