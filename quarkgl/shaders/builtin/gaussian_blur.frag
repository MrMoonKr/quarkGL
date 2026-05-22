#version 460 core
#pragma qrk_include < post_processing.frag>
in vec2 texCoords;

out vec4 fragColor;

uniform sampler2D u_screenTexture;
uniform bool u_horizontal;

void main() {
  fragColor = qrk_gaussianBlurOnePass(u_screenTexture, texCoords, u_horizontal);
}
