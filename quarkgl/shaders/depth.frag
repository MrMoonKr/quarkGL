#pragma once

/**
 * Calculates the linear space depth based on non-linear depth buffer.
 * Input can be gl_FragCoord.z. Returns the the linearized depth between `near`
 * and `far`.
 */
float qrk_linearize_depth(float depth, float near, float far) {
    // Convert to Normalized Device Coordinates.
    float normalizedDepth = depth * 2.0 - 1.0;
    return (2.0 * near * far) / (far + near - normalizedDepth * (far - near));
}

/**
 * Calculates a depth color (between 0.0-1.0) for the current fragment based on
 * `near` and `far` planes.
 */
vec4 qrk_depth_color(float near, float far) {
    float depth = qrk_linearize_depth(gl_FragCoord.z, near, far);
    // Convert depth to 0.0-1.0 range.
    float depthColor = depth / far;
    return vec4(vec3(depthColor), 1.0);
}
