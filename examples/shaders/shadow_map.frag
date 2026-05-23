#version 460 core
#pragma qrk_include < core.glsl>
#pragma qrk_include < standard_lights_phong.frag>
#pragma qrk_include < depth.frag>

// An example fragment shader with shadow mapping.

in VS_OUT {
    vec2 texCoords;
    vec3 fragPos;
    vec3 fragNormal;
    vec4 fragPosLightSpace;
}
fs_in;

out vec4 fragColor;

uniform QrkMaterial u_material;
uniform sampler2D u_shadowMap;

void main() {
    vec3 normal = normalize(fs_in.fragNormal);
    float shadowBias =
            qrk_shadow_bias(0.001, 0.01, normal, qrk_directionalLights[0].direction);
    float shadow = qrk_shadow(u_shadowMap, fs_in.fragPosLightSpace, shadowBias);

    // Shade with normal lights.
    vec3 result = qrk_shade_all_lights_blinn_phong(u_material, fs_in.fragPos, normal,
                                             fs_in.texCoords, shadow, /*ao=*/1);

    // Add emissions.
    result += qrk_shade_emission(u_material, fs_in.fragPos, fs_in.texCoords);

    fragColor = vec4(result, qrk_material_alpha(u_material, fs_in.texCoords));
    fragColor.rgb = qrk_gamma_correct(fragColor.rgb);
}
