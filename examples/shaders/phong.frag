#version 460 core
#pragma qrk_include < core.glsl>
#pragma qrk_include < standard_lights_phong.frag>
#pragma qrk_include < depth.frag>

// An example fragment shader with Phong illumination.

in VS_OUT {
    vec2 texCoords;
    vec3 fragPos;
    vec3 fragNormal;
}
fs_in;

out vec4 fragColor;

uniform QrkMaterial u_material;
uniform bool u_skipGamma;

void main() {
    vec3 normal = normalize(fs_in.fragNormal);

    // Shade with normal lights.
    vec3 result = qrk_shade_all_lights_blinn_phong(u_material, fs_in.fragPos, normal,
                                             fs_in.texCoords);

    // Add emissions.
    result += qrk_shade_emission(u_material, fs_in.fragPos, fs_in.texCoords);

    fragColor = vec4(result, qrk_material_alpha(u_material, fs_in.texCoords));
    if (!u_skipGamma) {
        fragColor.rgb = qrk_gamma_correct(fragColor.rgb);
    }
}
