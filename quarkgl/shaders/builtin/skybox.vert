#version 460 core
layout(location = 0) in vec3 a_position;

out vec3 skyboxCoords;

// Note that the u_view matrix should *not* have any translation, since the u_skybox
// is always rendered at the camera origin and thus should "follow" the camera.
uniform mat4 u_view;
uniform mat4 u_projection;

void main() {
    // No u_model transform needed for a u_skybox.
    vec4 pos = u_projection * u_view * vec4(a_position, 1.0);
    // The u_skybox is meant to be drawn last, so to take advantage of early depth
    // testing, we set the vertex's z component to w so that after the perspective
    // division by w the resulting normalized device coordinate will equal 1.0,
    // which is the maximum depth value. This allows the u_skybox to be rendered
    // behind everything else.
    gl_Position = pos.xyww;
    // The sample coordinates are equivalent to the interpolated vertex positions.
    skyboxCoords = a_position;
}
