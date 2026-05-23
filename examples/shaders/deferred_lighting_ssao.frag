#version 460 core
#define QRK_MAX_POINT_LIGHTS 32
#pragma qrk_include < gamma.frag>
#pragma qrk_include < tone_mapping.frag>
#pragma qrk_include < standard_lights_phong.frag>
#pragma qrk_include < lighting.frag>
in vec2 texCoords;

out vec4 fragColor;

uniform sampler2D u_gPositionAO;
uniform sampler2D u_gNormalRoughness;
uniform sampler2D u_gAlbedoMetallic;
uniform sampler2D u_gEmission;
uniform sampler2D qrk_ssao;

uniform vec3 u_ambient;
uniform float u_shininess;
uniform QrkAttenuation u_emissionAttenuation;

uniform bool u_useSsao;

void main() {
    // Extract G-Buffer for Blinn-Phong shading.
    vec3 fragPos_viewSpace = texture(u_gPositionAO, texCoords).rgb;
    vec3 fragNormal_viewSpace = texture(u_gNormalRoughness, texCoords).rgb;
    vec3 fragAlbedo = texture(u_gAlbedoMetallic, texCoords).rgb;
    vec3 fragSpecular = vec3(texture(u_gAlbedoMetallic, texCoords).a);
    vec3 fragEmission = texture(u_gEmission, texCoords).rgb;
    float fragAmbientOcclusion = texture(qrk_ssao, texCoords).r;

    if (!u_useSsao) {
        fragAmbientOcclusion = 1.0;
    }

    // Shade with normal lights.
    vec3 color = qrk_shade_all_lights_blinn_phong_deferred(
            fragAlbedo, fragSpecular, u_ambient, u_shininess, fragPos_viewSpace,
            fragNormal_viewSpace, /*shadow=*/0.0, fragAmbientOcclusion);

    // Add emissions.
    color += qrk_shade_emission_deferred(fragEmission, fragPos_viewSpace,
                                     u_emissionAttenuation);

    color = qrk_tone_map_aces_approx(color);
    color = qrk_gamma_correct(color);
    fragColor = vec4(color, 1.0);
}
