#version 460 core
layout(location = 0) in vec3 a_position;
layout(location = 1) in vec3 a_normal;
layout(location = 2) in vec3 a_tangent;
layout(location = 3) in vec2 a_uv;
layout(location = 4) in mat4 instanceModel;

out VS_OUT {
    vec2 texCoords;
    vec3 fragPos;
    vec3 fragNormal;
}
vs_out;

uniform mat4 u_view;
uniform mat4 u_projection;

void main() {
    gl_Position = u_projection * u_view * instanceModel * vec4(a_position, 1.0);

    vs_out.texCoords = a_uv;
    vs_out.fragPos = vec3(u_view * instanceModel * vec4(a_position, 1.0));
    vs_out.fragNormal =
            mat3(transpose(inverse(u_view * instanceModel))) * a_normal;
}
