#version 300 es
precision mediump float;

#define TAU 6.2831853071

uniform vec2 u_resolution;
uniform float u_time_ms;
uniform float u_opacity;
uniform sampler2D u_texture_color;
uniform sampler2D u_texture_mono;

in vec2 v_uv;
in vec2 v_screenuv;
out vec4 fragColor;

float getWaveDisplacement(vec2 v_uv, float currentTime) {    
    float t = currentTime - 2.0;
    float A = 0.3; // Wave amplitude
    float displacement = 0.0;
    
    // Distance from center impact point
    float x = distance(v_uv, vec2(0.5, 0.5));
    
    // Improved temporal falloff for more dramatic slowdown
    float globalDecay = exp(-t * 0.8); // More gradual overall decay
    
    // Multiple wave frequencies with dispersion
    for (float k = 1.0; k < 6.0; k++) {
        float waveSpeed = sqrt(k) * 0.5; // Capillary wave dispersion
        float X = x - waveSpeed * t;
        
        // Improved amplitude preservation at trailing edge, sharper crater
        float amplitudeFalloff = exp(-X * X * 6.0); // Increased from 2.0 for sharper crater
        
        float wave = A * sin(k * X) * amplitudeFalloff * globalDecay / k;
        displacement += wave;
    }
    
    // Vertical falloff - stronger in center, weaker at edges
    float verticalFalloff = 1.0 - abs(v_uv.y - 0.5) * 2.0;
    verticalFalloff = max(0.0, verticalFalloff);
    verticalFalloff = verticalFalloff * verticalFalloff;
    
    return displacement * verticalFalloff;
}

void main() {
    float time_s = u_time_ms / 1000.0;
    float o = texture(u_texture_color, v_uv * 0.25 + vec2(0.0, time_s * 0.025)).r;
    float d = (texture(u_texture_mono, v_uv * 0.25 - vec2(0.0, time_s * 0.02 + o * 0.02)).r * 2.0 - 1.0);
    
    float waveDisplacement = 0.0;
    if(time_s > 1.0) {
        waveDisplacement = getWaveDisplacement(v_uv, time_s);
    } 
    float v = v_uv.y + d * 0.1 - 0.2;
    v = 1.0 - abs(v * 2.0 - 1.0);
    v = pow(v, 2.0 + sin((time_s * 0.2 + d * 0.25) * TAU) * 0.5);
    
    vec3 color = vec3(0.0);
    
    float x = (1.0 - v_uv.x * 0.75);
    float y = 1.0 - abs(v_uv.y * 2.0 - 1.0);
    color += vec3(x * 0.5, y, x) * v;
    
    vec2 seed = (v_uv.xy * u_resolution.xy).xy;
    vec2 r;
    r.x = fract(sin((seed.x * 12.9898) + (seed.y * 78.2330)) * 43758.5453);
    r.y = fract(sin((seed.x * 53.7842) + (seed.y * 47.5134)) * 43758.5453);

    float s = mix(r.x, (sin((time_s * 2.5 + 60.0) * r.y) * 0.5 + 0.5) * ((r.y * r.y) * (r.y * r.y)), 0.04); 
    color += pow(s, 255.0) * (1.0 - v);

    float luminance = (0.2126 * color.r * 255.0) + (0.7152 * color.g * 255.0) + (0.0722 * color.b * 255.0);
    
    fragColor.rgb = color;
    fragColor.a = u_opacity;
    fragColor.a = luminance > 235.0 ? 0.0 : luminance < 25.0 ? pow(luminance / 255.0, 3.0) : pow(luminance / 255.0, 0.004);
}
