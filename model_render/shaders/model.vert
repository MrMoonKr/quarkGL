#version 460 core
layout(location = 0) in vec3 a_position;
layout(location = 1) in vec3 a_normal;
layout(location = 2) in vec3 a_tangent;
layout(location = 3) in vec2 a_uv;

// An example simple vertex shader.
// TODO: Pull this into a base shader.

out VS_OUT {
  vec2 texCoords;
  vec3 fragPos;
  vec3 fragNormal;
}
vs_out;

uniform mat4 u_model;
uniform mat4 u_view;
uniform mat4 u_projection;

uniform bool u_inverseNormals;

void main() {
  gl_Position = u_projection * u_view * u_model * vec4(a_position, 1.0);

  vs_out.texCoords = a_uv;
  vs_out.fragPos = vec3(u_view * u_model * vec4(a_position, 1.0));
  vs_out.fragNormal = mat3(transpose(inverse(u_view * u_model))) *
                      (u_inverseNormals ? -a_normal : a_normal);
}
