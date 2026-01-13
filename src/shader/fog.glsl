#version 300 es
precision mediump float;

// GLSL
uniform float u_fogR;
uniform float u_fogG;
uniform float u_fogB;

out vec4 color;

// Screen-space info
uniform vec2 u_resolution;   // viewport size in pixels
uniform vec2 u_holePos;      // hole center in normalized coordinates (0.0 to 1.0)
uniform float u_radius;

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
  vec2 uv = gl_FragCoord.xy / u_resolution;
  vec2 holeCenter = u_holePos; // Already normalized
  
  // Adjust for aspect ratio to make circular holes
  float aspectRatio = u_resolution.x / u_resolution.y;
  uv.y /= aspectRatio;
  holeCenter.y /= aspectRatio;
  
  float dist = distance(uv, holeCenter);
  float r = u_radius;
  float ditherRange = 0.05;

  // Clear hole (normalized distance)
  if (dist < r) {
    discard;
  }

  // Dithered ring
  if (dist < (r + ditherRange)) {
    // Calculate position within dither range (0.0 at r, 1.0 at r+ditherRange)
    float ditherProgress = (dist - r) / ditherRange;
    
    if (bayer4(gl_FragCoord.xy) > ditherProgress) {
        discard;
    }

    color = vec4(u_fogR, u_fogG, u_fogB, 1.0);
    return;
  }

  // Full fog
  color = vec4(u_fogR, u_fogG, u_fogB, 1.0);
}
