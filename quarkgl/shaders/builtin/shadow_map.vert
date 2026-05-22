#version 460 core
layout(location = 0) in vec3 a_position;

uniform mat4 u_model;
uniform mat4 u_lightViewProjection;

void main() {
  gl_Position = u_lightViewProjection * u_model * vec4(a_position, 1.0);
}
