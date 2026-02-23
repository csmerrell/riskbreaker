#version 300 es
precision mediump float;

uniform sampler2D u_image;
in vec2 v_uv;

uniform float u_progress;      // 0.0 to 1.0
uniform ivec2 u_squaresMin;    // minimum number of squares (e.g., ivec2(20, 20))
uniform int u_steps;           // quantization steps (e.g., 50)

out vec4 fragColor;

void main() {
    // Calculate distance from center of transition (peaks at 0.5)
    float d = min(u_progress, 1.0 - u_progress);
    
    // Quantize the distance for stepped effect
    float dist = u_steps > 0 ? ceil(d * float(u_steps)) / float(u_steps) : d;
    
    // Calculate pixelation square size based on distance
    vec2 squareSize = 2.0 * dist / vec2(u_squaresMin);
    
    // Pixelate the UV coordinates - floor to grid, then add 0.5 to center sample
    vec2 pixelatedUV = dist > 0.0 ? (floor(v_uv / squareSize) + 0.5) * squareSize : v_uv;
    
    // Sample the scene at pixelated coordinates
    vec4 sceneColor = texture(u_image, pixelatedUV);
    
    fragColor = sceneColor;
}
