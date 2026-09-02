#version 300 es
precision mediump float;

uniform sampler2D u_image;
in vec2 v_uv;

uniform float u_progress;      // 0.0 to 1.0
uniform ivec2 u_squaresMin;    // minimum number of squares (e.g., ivec2(20, 20))
uniform int u_steps;           // quantization steps (e.g., 50)

out vec4 fragColor;

void main() {
    float d = clamp(u_progress, 0.0, 1.0);

    // Quantize the distance for stepped effect
    float dist = u_steps > 0 ? ceil(d * float(u_steps)) / float(u_steps) : d;
    
    // Calculate pixelation square size based on distance
    vec2 squareSize = 2.0 * dist / vec2(u_squaresMin);
    
    // Pixelate the UV coordinates - floor to grid, then add 0.5 to center sample
    vec2 pixelatedUV = dist > 0.0 ? (floor(v_uv / squareSize) + 0.5) * squareSize : v_uv;
    
    // Sample the scene at pixelated coordinates
    vec4 sceneColor = texture(u_image, pixelatedUV);

    // Mix toward #151d28 as progress increases
    vec3 targetColor = vec3(0.082, 0.114, 0.157);
    sceneColor.rgb = mix(sceneColor.rgb, targetColor, d);
    
    fragColor = sceneColor;
}
