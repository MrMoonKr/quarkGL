#version 460 core
#pragma qrk_include < normals.frag>
in vec2 texCoords;

out vec4 fragColor;

uniform sampler2D u_screenTexture;
// Which component of the G-Buffer to visualize.
uniform int u_gBufferVis;

void main() {
    vec4 color = texture(u_screenTexture, texCoords);

    if (u_gBufferVis == 1) {
        // Positions.
        fragColor = vec4(color.rgb, 1.0);
    } else if (u_gBufferVis == 2) {
        // AO.
        fragColor = vec4(color.a, color.a, color.a, 1.0);
    } else if (u_gBufferVis == 3) {
        // Normals.
        if (color.rgb == vec3(0.0)) {
            // Fragment has no normal info.
            fragColor = vec4(0.0, 0.0, 0.0, 1.0);
        } else {
            fragColor = qrk_normal_color(color.rgb);
        }
    } else if (u_gBufferVis == 4) {
        // Roughness.
        fragColor = vec4(color.a, color.a, color.a, 1.0);
    } else if (u_gBufferVis == 5) {
        // Albedo.
        fragColor = vec4(color.rgb, 1.0);
    } else if (u_gBufferVis == 6) {
        // Metallic.
        fragColor = vec4(color.a, color.a, color.a, 1.0);
    } else if (u_gBufferVis == 7) {
        // Emission.
        fragColor = vec4(color.rgb, 1.0);
    } else {
        fragColor = vec4(1.0, 0.0, 0.0, 1.0);
    }
}
