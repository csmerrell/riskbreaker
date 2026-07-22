#version 300 es
precision mediump float;

uniform sampler2D u_graphic;

in vec2 v_uv;
in vec2 v_screenuv;
out vec4 fragColor;

void main() {
    vec4 currentPixel = texture(u_graphic, v_uv);
    
    // Early exit: if current pixel is empty, return it as-is
    if (currentPixel.a < 0.01) {
        fragColor = currentPixel;
        return;
    }
            
    fragColor = vec4(0.0,0.0,0.0,1.0);
}
