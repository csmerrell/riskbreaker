#version 300 es
precision mediump float;

uniform sampler2D u_graphic;

uniform vec3 u_color;
uniform int u_sheetFrameCt;

in vec2 v_uv;
in vec2 v_screenuv;
out vec4 fragColor;

float normalizeFrameCoordinate(float coord, int numFramesInAxis) {
    int frameIndex = int(floor(coord * float(numFramesInAxis))); 
    float zeroFrameMapped = coord - float(frameIndex) / float(numFramesInAxis);
    return zeroFrameMapped * float(numFramesInAxis);
}

void main() {
    vec4 spriteFrag = texture(u_graphic, v_uv);

    vec2 n_uv = vec2(normalizeFrameCoordinate(v_uv.x, u_sheetFrameCt), normalizeFrameCoordinate(v_uv.y, u_sheetFrameCt));

    if(spriteFrag.r > 0.98 && spriteFrag.g > 0.98 && spriteFrag.b > 0.98 && spriteFrag.a > 0.0) {
        fragColor = vec4(u_color.rgb, spriteFrag.a);
    } else {
        fragColor = spriteFrag;
    }
}