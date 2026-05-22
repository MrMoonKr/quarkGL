#version 460 core
in vec2 texCoords;

out vec4 fragColor;

uniform sampler2D u_screenTexture;
uniform float u_lod;

void main() { fragColor = textureLod(u_screenTexture, texCoords, u_lod); }
