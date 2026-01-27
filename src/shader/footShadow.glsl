#version 300 es
precision mediump float;

uniform sampler2D u_graphic;

uniform vec2 u_origin;
uniform float u_height;
uniform float u_width;

in vec2 v_uv;
in vec2 v_screenuv;
out vec4 fragColor;

float bayer4(vec2 p) {
  ivec2 ip = ivec2(mod(p, 4.0));
  int index =
    ip == ivec2(0,0) ?  0 :
    ip == ivec2(1,0) ?  8 :
    ip == ivec2(2,0) ?  2 :
    ip == ivec2(3,0) ? 10 :
    ip == ivec2(0,1) ? 12 :
    ip == ivec2(1,1) ?  4 :
    ip == ivec2(2,1) ? 14 :
    ip == ivec2(3,1) ?  6 :
    ip == ivec2(0,2) ?  3 :
    ip == ivec2(1,2) ? 11 :
    ip == ivec2(2,2) ?  1 :
    ip == ivec2(3,2) ?  9 :
    ip == ivec2(0,3) ? 15 :
    ip == ivec2(1,3) ?  7 :
    ip == ivec2(2,3) ? 13 :
                        5;

  return float(index) / 16.0;
}

void main() {
    vec4 spriteFrag = texture(u_graphic, v_uv);

    if(spriteFrag.a != 0.0) {
        fragColor = spriteFrag;
    } else {
        vec2 p = v_uv - u_origin;
        vec2 r = vec2(u_width, u_height);

        float ellipse = dot(p / r, p / r);

        float edgeStrength = smoothstep(1.0, 0.4, ellipse);
        float dither = bayer4(gl_FragCoord.xy);

        if(ellipse >= 1.0 || dither > edgeStrength) {
            fragColor = spriteFrag;
        } else {
            fragColor = vec4(0.1,0.1,0.1,edgeStrength);
        }
    }
}