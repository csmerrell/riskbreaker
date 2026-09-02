#version 300 es
precision mediump float;

uniform sampler2D u_graphic;
uniform vec3 u_borderColor; // RGB color for the border (red for hurt, green for heal)
uniform vec2 u_texelSize; // Size of one pixel in normalized coordinates (1/width, 1/height)
uniform int u_columns; // Number of columns in spritesheet
uniform int u_rows; // Number of rows in spritesheet

in vec2 v_uv;
in vec2 v_screenuv;
out vec4 fragColor;

// Normalize UV coordinates to current frame (0-1 within the current sprite frame)
float normalizeFrameCoordinate(float coord, int numFramesInAxis) {
    int frameIndex = int(floor(coord * float(numFramesInAxis))); 
    float zeroFrameMapped = coord - float(frameIndex) / float(numFramesInAxis);
    return zeroFrameMapped * float(numFramesInAxis);
}

void main() {
    vec4 currentPixel = texture(u_graphic, v_uv);
    
    // Early exit: if current pixel is empty, return it as-is
    if (currentPixel.a < 0.01) {
        fragColor = currentPixel;
        return;
    }
    
    // Size of one pixel in full texture UV space
    // u_texelSize is already [1/textureWidth, 1/textureHeight]
    vec2 pixelSize = u_texelSize;
    
    // Check 8 neighbors (cardinal + diagonal directions)
    // As soon as we find an empty neighbor, this is a border pixel
    vec2 offsets[8];
    offsets[0] = vec2(-1.0,  0.0); // left
    offsets[1] = vec2( 1.0,  0.0); // right
    offsets[2] = vec2( 0.0, -1.0); // up
    offsets[3] = vec2( 0.0,  1.0); // down
    offsets[4] = vec2(-1.0, -1.0); // top-left
    offsets[5] = vec2( 1.0, -1.0); // top-right
    offsets[6] = vec2(-1.0,  1.0); // bottom-left
    offsets[7] = vec2( 1.0,  1.0); // bottom-right
    
    for (int i = 0; i < 8; i++) {
        vec2 neighborUV = v_uv + offsets[i] * pixelSize;
        vec4 neighborPixel = texture(u_graphic, neighborUV);
        
        // If we found an empty neighbor, this is a border pixel
        if (neighborPixel.a < 0.01) {
            fragColor = vec4(u_borderColor, currentPixel.a);
            return;
        }
    }
    
    // All neighbors are non-empty, so this is an interior pixel
    fragColor = currentPixel;
}
