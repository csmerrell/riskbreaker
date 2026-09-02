#version 300 es
precision mediump float;

uniform sampler2D u_graphic;
uniform float u_progress; // 0.0 to 1.0 - controls shimmer position from top to bottom
uniform int u_sheetFrameCt; // Number of frames in spritesheet (12 for composite actors)

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
    
    // Skip transparent pixels
    if (spriteFrag.a == 0.0) {
        fragColor = spriteFrag;
        return;
    }
    
    // Normalize UV coordinates to current sprite frame
    vec2 n_uv = vec2(
        normalizeFrameCoordinate(v_uv.x, u_sheetFrameCt), 
        normalizeFrameCoordinate(v_uv.y, u_sheetFrameCt)
    );
    
    // Gold shimmer colors (rich gold gradient)
    vec3 goldLight = vec3(1.0, 1.0, 1.0);   // Bright gold
    vec3 goldMid = vec3(0.95, 0.95, 0.95);     // Mid gold
    vec3 goldDark = vec3(0.8, 0.8, 0.8);   // Deep gold
    
    // Calculate angled shimmer position
    // Angle the shimmer at ~30 degrees by mixing x and y coordinates
    float angleInfluence = 0.3; // Controls angle steepness
    float angledY = n_uv.y + (n_uv.x - 0.5) * angleInfluence;
    
    // Shimmer band width (controls how tall the gradient is)
    float bandWidth = 0.35;
    
    // Calculate shimmer center position (moves from -bandWidth to 1.0 + bandWidth)
    // This allows the shimmer to smoothly enter from top and exit at bottom
    float shimmerCenter = -bandWidth + u_progress * (1.0 + 2.0 * bandWidth);
    
    // Distance from current pixel to shimmer center
    float distanceFromCenter = angledY - shimmerCenter;
    
    // Create gradient falloff with three zones:
    // 1. Leading edge (top) - fade in from dark gold
    // 2. Center - bright gold
    // 3. Trailing edge (bottom) - fade out to transparent
    
    float normalizedDist = distanceFromCenter / bandWidth;
    
    // Shimmer intensity (0.0 when far from shimmer, 1.0 at center)
    float shimmerIntensity = 0.0;
    
    if (normalizedDist < -0.5) {
        // Before shimmer - no effect
        shimmerIntensity = 0.0;
    } else if (normalizedDist < 0.0) {
        // Leading edge - fade in from dark to bright gold
        float t = (normalizedDist + 0.5) / 0.5; // 0.0 to 1.0
        t = smoothstep(0.0, 1.0, t); // Smooth fade in
        shimmerIntensity = t;
    } else if (normalizedDist < 0.3) {
        // Center peak - full shimmer
        shimmerIntensity = 1.0;
    } else if (normalizedDist < 0.8) {
        // Trailing edge - fade out
        float t = (normalizedDist - 0.3) / 0.5; // 0.0 to 1.0
        t = smoothstep(0.0, 1.0, t); // Smooth fade out
        shimmerIntensity = 1.0 - t;
    } else {
        // After shimmer - no effect
        shimmerIntensity = 0.0;
    }
    
    // Select gold color based on position in gradient
    vec3 goldColor;
    if (normalizedDist < 0.0) {
        // Leading edge: dark to mid gold
        float t = (normalizedDist + 0.5) / 0.5;
        goldColor = mix(goldDark, goldMid, smoothstep(0.0, 1.0, t));
    } else if (normalizedDist < 0.3) {
        // Center: mid to light gold
        float t = normalizedDist / 0.3;
        goldColor = mix(goldMid, goldLight, smoothstep(0.0, 1.0, t));
    } else {
        // Trailing edge: light to mid gold
        float t = (normalizedDist - 0.3) / 0.5;
        goldColor = mix(goldLight, goldMid, smoothstep(0.0, 1.0, t));
    }
    
    // Apply shimmer as additive blend with semi-transparency
    float shimmerAlpha = 0.5 * shimmerIntensity; // Semi-transparent
    vec3 finalColor = spriteFrag.rgb + goldColor * shimmerAlpha;
    
    // Clamp to prevent over-brightening
    finalColor = clamp(finalColor, 0.0, 1.0);
    
    fragColor = vec4(finalColor, spriteFrag.a);
}
