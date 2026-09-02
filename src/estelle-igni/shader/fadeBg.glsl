#version 300 es
precision mediump float;

uniform sampler2D u_graphic;
in vec2 v_uv;
in vec2 v_screenuv;

uniform float u_fogR;
uniform float u_fogG;
uniform float u_fogB;

uniform float u_progress;

out vec4 fragColor;

void main() {
    vec4 sceneColor = texture(u_graphic, v_uv);
    
    // Leave fully-transparent pixels untouched
    if(sceneColor.a == 0.0) {
        fragColor = sceneColor;
        return;
    }

    vec3 fogColor = vec3(u_fogR, u_fogG, u_fogB);
    vec3 fogMixed = mix(fogColor, sceneColor.rgb, 1.0 - u_progress);

    fragColor = vec4(sceneColor.rgb * fogMixed, sceneColor.a);
}
