#version 460 core
#pragma qrk_include < transforms.glsl>
layout(location = 0) in vec3 a_position;
layout(location = 1) in vec3 a_normal;
layout(location = 2) in vec3 a_tangent;
layout(location = 3) in vec2 a_uv;

out VS_OUT {
  vec2 texCoords;
  vec3 fragPos_viewSpace;
  vec3 fragNormal_viewSpace;
  mat3 fragTBN_viewSpace;  // Transforms from tangent frame to u_view frame.
}
vs_out;

uniform mat4 u_model;
uniform mat4 u_view;
uniform mat4 u_projection;

void main() {
  gl_Position = u_projection * u_view * u_model * vec4(a_position, 1.0);

  vs_out.texCoords = a_uv;
  vs_out.fragPos_viewSpace = vec3(u_view * u_model * vec4(a_position, 1.0));

  mat3 modelViewInverseTranspose = mat3(transpose(inverse(u_view * u_model)));

  // Transform vertex normal, to compare with normal mapping.
  vs_out.fragNormal_viewSpace = modelViewInverseTranspose * a_normal;

  // Build a tangent space transform matrix.
  vec3 normal_viewSpace = normalize(vs_out.fragNormal_viewSpace);
  vec3 tangent_viewSpace =
      normalize(vec3(u_view * u_model * vec4(a_tangent, 0.0)));
  vs_out.fragTBN_viewSpace =
      qrk_calculateTBN(normal_viewSpace, tangent_viewSpace);
}
