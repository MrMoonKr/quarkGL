#pragma once

/**
 * Samples a normal map and converts the texture colors [0..1] to a normalized
 * normal vector [-1..1], in tangent space.
 */
vec3 qrk_sample_normal_map(sampler2D u_normalMap, vec2 texCoords) {
    return normalize(texture(u_normalMap, texCoords).xyz * 2.0 - 1.0);
}

/** Converts a normal to a color representation, with 100% opacity. */
vec4 qrk_normal_color(vec3 normal) { return vec4((normal + 1.0) / 2.0, 1.0); }
