export const spriteShadowShaderOpts = {
    name: 'FootRingShader',
    fragmentSource: `#version 300 es
precision mediump float;

uniform sampler2D u_graphic; // Sprite texture (updated name)

in vec2 v_uv; // Input texture coordinates
out vec4 fragColor; // Final output color

float normalizeFrameCoordinate(float coord, int numFramesInAxis) {
    int frameIndex = int(floor(coord * float(numFramesInAxis))); 
    float zeroFrameMapped = coord - float(frameIndex) / float(numFramesInAxis);
    return zeroFrameMapped * float(numFramesInAxis);
}

void main() {
    // Ellipse center and radii
    // This works on the idle sprite frame  
    vec2 center = vec2(0.65, 0.9);
    vec2 radius = vec2(0.15, 0.075);

    // Compute absolute distances from the center
    float normalizedX = normalizeFrameCoordinate(v_uv.x, 6);
    float distX = abs(normalizedX - center.x);
    float distY = abs(v_uv.y - center.y);

    // Check if outside bounding box (early discard)
    vec4 spriteFrag = texture(u_graphic, v_uv);
    if (distY > radius.y || distance(vec2(normalizedX, v_uv.y), center) > .17) {
        fragColor = spriteFrag;
    } else {
        float alphaX = 1.0 - distX / radius.x;
        float alphaY = max(.01, 1.0 - distY / radius.y);

        // Compute alpha blending from center to edge
        float alpha = mix(0.2, 0.8, alphaX * alphaY); // Min for elliptical fade

        // Output color (black with variable alpha)
        fragColor = spriteFrag.a > 0. ? spriteFrag : vec4(0.0, 0.0, 0.0, alpha);
    }
}
`,
};
