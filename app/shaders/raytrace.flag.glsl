precision highp float;

uniform float time;
uniform float modValue;

uniform vec2 resolution;

uniform vec3 cameraPosition;
uniform mat4 cameraWorldMatrix;
uniform mat4 cameraProjectionMatrixInverse;

const vec3 lightDir = vec3(-0.57, 0.57, 0.57);

vec2 trans(vec2 p) {
    return mod(p, modValue * 2.0) - modValue;
}

vec3 trans(vec3 p) {
    return mod(p, modValue * 2.0) - modValue;
}

float smoothMin(float d1, float d2, float k){
    float h = exp(-k * d1) + exp(-k * d2);
    return -log(h) / k;
}

vec3 rotate(vec3 p, float angle, vec3 axis){
    vec3 a = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float r = 1.0 - c;
    mat3 m = mat3(
        a.x * a.x * r + c,
        a.y * a.x * r + a.z * s,
        a.z * a.x * r - a.y * s,
        a.x * a.y * r - a.z * s,
        a.y * a.y * r + c,
        a.z * a.y * r + a.x * s,
        a.x * a.z * r + a.y * s,
        a.y * a.z * r - a.x * s,
        a.z * a.z * r + c
    );
    return m * p;
}

float distFuncTorus(vec3 p) {
    vec2 t = vec2(0.75, 0.25);
    vec2 r = vec2(length(p.xy) - t.x, p.z);
    return length(trans(r)) - t.y;
}

float distFuncFloor(vec3 p) {
    return dot(p, vec3(0.0, 1.0, 0.0)) + 1.0;
}

float distFuncSphere(vec3 p) {
    return length(trans(p)) - 1.0;
}

float distFuncBox(vec3 p) {
    vec3 q = abs(trans(p));
    q = rotate(q, radians(time * 10.0), vec3(1.0, 0.5, 0.0));
    return length(max(q - vec3(0.5, 0.5, 0.5), 0.0)) - 0.4;
}

float distFunc(vec3 p) {
    //p = rotate(p, radians(time * 10.0), vec3(1.0, 0.5, 0.0));
    float d1 = distFuncBox(p);
    float d2 = distFuncSphere(p);
    //float d2 = distFuncFloor(p);
    //return min(d1, d2);
    //return max(d1, -d2);
    return smoothMin(d1, d2, 8.0);
}

vec3 genNormal(vec3 p) {
    float d = 0.0001;
    return normalize(vec3(
        distFunc(p + vec3(  d, 0.0, 0.0)) - distFunc(p + vec3( -d, 0.0, 0.0)),
        distFunc(p + vec3(0.0,   d, 0.0)) - distFunc(p + vec3(0.0,  -d, 0.0)),
        distFunc(p + vec3(0.0, 0.0,   d)) - distFunc(p + vec3(0.0, 0.0,  -d))
    ));
}


void main(void) {

    vec2 screenPos = ( gl_FragCoord.xy * 2.0 - resolution ) / min( resolution.x, resolution.y );

    vec3 ray = (cameraWorldMatrix * cameraProjectionMatrixInverse * vec4( screenPos.xy, 1.0, 1.0 )).xyz;
    ray = normalize( ray );

    vec3 cPos = cameraPosition;
    float tmp, dist;
    tmp = 0.0;
    vec3 dPos = cPos;
    for (int i = 0; i < 128; i++) {
        dist = distFunc(dPos);
        if (dist < 0.001) { break; }
        tmp += dist;
        dPos = cPos + tmp * ray;
    }

    vec3 color;
    if (abs(dist) < 0.001) {
        vec3 normal = genNormal(dPos);
        float diff = clamp(dot(lightDir, normal), 0.4, 1.0);
        float spec = pow(clamp(dot(lightDir, normal), 0.0, 1.0), 50.0);

        float u = 1.0 - floor(mod(dPos.x, 2.0));
        float v = 1.0 - floor(mod(dPos.z, 2.0));
        if((u == 1.0 && v < 1.0) || (u < 1.0 && v == 1.0)){
            diff *= 1.4;
        }

        color = normal * diff + vec3(spec);
        //color = normal;
    } else {
        color = vec3(0.3);
    }
    gl_FragColor = vec4(color, 1.0);
    
}