#version 460 core
in vec2 texCoords;

out vec4 fragColor;

uniform sampler2D u_screenTexture;

void main() { fragColor = texture(u_screenTexture, texCoords); }
