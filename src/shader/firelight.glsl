#version 300 es
precision mediump float;

uniform sampler2D u_image;
in vec2 v_uv;

uniform float u_fogR;
uniform float u_fogG;
uniform float u_fogB;

uniform vec2 u_fireOrigin;

out vec4 fragColor;

void main() {
    vec4 sceneColor = texture(u_image, v_uv);
    
    // Use default fog color if uniforms aren't set
    vec3 fogColor = vec3(u_fogR, u_fogG, u_fogB);

    vec2 p = v_uv - u_fireOrigin;
    vec2 ellipseRads = vec2(0.65, 1.0);

    float radius = 0.75;
    float d = length((v_uv - u_fireOrigin) / ellipseRads);
    float falloff = sqrt(d / radius);

    // Light gradient from fog color to warm yellow/orange
    vec3 warmColor = vec3(0.9, 0.8, 0.7);

    // Step1. Hue-shift to yellow. | Step2. Add (restore) Brightness.
    vec3 lightMixed = mix(fogColor, warmColor, 1.0 - falloff);
    lightMixed = lightMixed * (1.0 + falloff * 3.0);

    fragColor = vec4(sceneColor.rgb * lightMixed, sceneColor.a);
}
