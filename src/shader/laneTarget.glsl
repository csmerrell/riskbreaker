#version 300 es
precision mediump float;

uniform sampler2D u_graphic;
uniform float u_time; // Time in milliseconds

in vec2 v_uv;
in vec2 v_screenuv;
out vec4 fragColor;

void main() {
    vec4 texColor = texture(u_graphic, v_uv);
    
    // Skip transparent pixels
    if (texColor.a == 0.0) {
        fragColor = texColor;
        return;
    }
    
    // Base layer: Mix 80% yellow with 20% original color
    vec3 targetColor = vec3(0.824, 0.749, 0.333); // #D2BF55 (yellow-500)
    vec3 baseColor = mix(texColor.rgb, targetColor, 0.8);
    
    // Animation timing: continuous movement, no pause
    float cycleTime = 2000.0;
    float moveTime = 2000.0;
    
    float timeInCycle = mod(u_time, cycleTime);
    float gradientProgress = timeInCycle / moveTime;
    
    // Gradient band is 15% of texture height (since visible area is ~30% of texture)
    float bandHeight = 0.15;
    
    // Calculate position of gradient center (0 at bottom, 1 at top, wraps beyond)
    // Start below texture (-bandHeight/2) so it wraps in smoothly
    float gradientCenter = -bandHeight * 0.5 + gradientProgress * (1.0 + bandHeight);
    
    // Distance from current pixel to gradient center (in UV space, Y goes 0 at top to 1 at bottom)
    float distanceFromCenter = abs((1.0 - v_uv.y) - gradientCenter);
    
    // Create smooth gradient falloff
    float gradientInfluence = smoothstep(bandHeight * 0.5, 0.0, distanceFromCenter);
    
    // Blend between base color and full target color based on gradient influence
    vec3 finalColor = mix(baseColor, targetColor, gradientInfluence);
    
    fragColor = vec4(finalColor, texColor.a);
}
