#version 300 es
precision mediump float;

uniform sampler2D u_graphic;
uniform sampler2D u_hatGraphic;
uniform float u_opacity;

in vec2 v_uv;
in vec2 v_screenuv;
out vec4 fragColor;

void main() {
    vec4 spriteFrag = texture(u_graphic, v_uv);

    const float FRAMES = 12.0;
    const float FRAME_SIZE = 1.0 / FRAMES;

    // Which frame are we in?
    vec2 frameIndex = floor(v_uv * FRAMES);

    // UV of the top-left of this frame
    vec2 frameOrigin = frameIndex * FRAME_SIZE;

    // Frame-local UV [0,1]
    vec2 localUV = fract(v_uv * FRAMES);
    float stepSize = 1.0 / 24.0; // if frame is 24 px tall

    for (float y = localUV.y; y <= 1.0; y += stepSize) {
        vec2 sampleUV = frameOrigin + vec2(localUV.x, y) * FRAME_SIZE;

        vec4 hatFrag = texture(u_hatGraphic, sampleUV);

        if (hatFrag.a > 0.0) {
            fragColor = vec4(0.0);
            return;
        }
    }

    if(spriteFrag.a == 0.0) {
        fragColor = spriteFrag;
    } else {
        fragColor = vec4(spriteFrag.rgb * u_opacity, u_opacity);
    }
    return;            
}
