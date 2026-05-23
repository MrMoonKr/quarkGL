#version 460 core
out vec4 fragColor;

in vec3 skyboxCoords;

uniform samplerCube u_skybox;

void main() { fragColor = texture(u_skybox, skyboxCoords); }
