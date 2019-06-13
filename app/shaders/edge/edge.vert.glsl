uniform float edgeWidth;

void main() {
    vec3 pos = (modelMatrix * vec4(position, 1.0)).xyz;
    pos += normal * edgeWidth;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}