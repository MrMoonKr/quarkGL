#pragma once

const float DEFAULT_MAGNITUDE = 0.1;

/**
 * Generate a normal line for visualization purposes. Requires
 * line_strip output.
 */
void qrk_generate_normal_line(vec4 position, vec3 normal, float magnitude) {
    gl_Position = position;
    EmitVertex();
    gl_Position = position + vec4(normal, 0.0) * magnitude;
    EmitVertex();
    EndPrimitive();
}

/**
 * Generate a normal line for visualization purposes. Requires
 * line_strip output.
 */
void qrk_generate_normal_line(vec4 position, vec3 normal) {
    qrk_generate_normal_line(position, normal, DEFAULT_MAGNITUDE);
}
