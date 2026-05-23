#version 460 core
layout(location = 0) in vec3 a_position;

out vec3 cubemapCoords;

uniform mat4 u_view;
uniform mat4 u_projection;

void main() {
    // No u_model transform needed for an equirect u_projection.
    gl_Position = u_projection * u_view * vec4(a_position, 1.0);
    // The sample coordinates are equivalent to the interpolated vertex positions.
    cubemapCoords = a_position;
}
