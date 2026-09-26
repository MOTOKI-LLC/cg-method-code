// ?. と ?? を使用する場合
const value = obj?.prop ?? "default";

// 同じ処理を別の構文で書く場合（0・false・空文字は保持）
const prop = obj == null ? undefined : obj.prop;
const equivalentValue = prop == null ? "default" : prop;
