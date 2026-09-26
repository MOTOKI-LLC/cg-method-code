fixed4 frag(v2f IN) : SV_Target
{
    fixed4 c = SampleSpriteTexture(IN.texcoord) * IN.color;
    c.rgb = c.rgb * 2 + max(fixed3(0,0,0), IN.color.rgb - 0.5) * 2;
    c.rgb *= c.a;
    return c;
}
