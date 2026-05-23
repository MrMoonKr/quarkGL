#version 460 core
#pragma qrk_include < core.glsl>
#pragma qrk_include < standard_lights_phong.frag>
#pragma qrk_include < standard_lights_pbr.frag>
#pragma qrk_include < depth.frag>
#pragma qrk_include < tone_mapping.frag>

// A fragment shader for rendering models.

in vec2 texCoords;

out vec4 fragColor;

uniform sampler2D u_gPositionAO;
uniform sampler2D u_gNormalRoughness;
uniform sampler2D u_gAlbedoMetallic;
uniform sampler2D u_gEmission;

uniform bool u_shadowMapping;
uniform bool u_ssao;
uniform sampler2D qrk_ssao;

uniform vec3 u_ambient;
uniform float u_shininess;
uniform float u_emissionIntensity;
uniform QrkAttenuation u_emissionAttenuation;

uniform int u_lightingModel;

uniform mat4 u_model;
uniform mat4 u_view;
uniform mat4 u_projection;
uniform mat4 u_lightViewProjection;
uniform sampler2D u_shadowMap;
uniform float u_shadowBiasMin;
uniform float u_shadowBiasMax;
uniform samplerCube qrk_irradianceMap;
uniform bool u_useIBL;
uniform samplerCube qrk_ggxPrefilteredEnvMap;
uniform float qrk_ggxPrefilteredEnvMapMaxLOD;
uniform sampler2D qrk_ggxIntegrationMap;
uniform vec3 u_shDiffuseCoefficients[9];

vec3 qrk_evaluate_sh_diffuse_irradiance(vec3 normal_worldSpace) {
    vec3 n = normalize(normal_worldSpace);
    vec3 irradiance =
            u_shDiffuseCoefficients[0] * 0.282095 +
            u_shDiffuseCoefficients[1] * (0.488603 * n.y) +
            u_shDiffuseCoefficients[2] * (0.488603 * n.z) +
            u_shDiffuseCoefficients[3] * (0.488603 * n.x) +
            u_shDiffuseCoefficients[4] * (1.092548 * n.x * n.y) +
            u_shDiffuseCoefficients[5] * (1.092548 * n.y * n.z) +
            u_shDiffuseCoefficients[6] * (0.315392 * (3.0 * n.z * n.z - 1.0)) +
            u_shDiffuseCoefficients[7] * (1.092548 * n.x * n.z) +
            u_shDiffuseCoefficients[8] * (0.546274 * (n.x * n.x - n.y * n.y));
    return max(irradiance, vec3(0.0));
}

void main() {
    // Extract G-Buffer for PBR rendering.
    vec3 fragPos_viewSpace = texture(u_gPositionAO, texCoords).rgb;
    float fragAO = texture(u_gPositionAO, texCoords).a;
    vec3 fragNormal_viewSpace = texture(u_gNormalRoughness, texCoords).rgb;
    float fragRoughness = texture(u_gNormalRoughness, texCoords).a;
    vec3 fragAlbedo = texture(u_gAlbedoMetallic, texCoords).rgb;
    float fragMetallic = texture(u_gAlbedoMetallic, texCoords).a;
    vec3 fragEmission = texture(u_gEmission, texCoords).rgb;

    vec3 color;

    // Shadow mapping. Currently only supported for one dir light.
    float shadow = 0.0;
    if (u_shadowMapping) {
        float shadowBias =
                qrk_shadow_bias(u_shadowBiasMin, u_shadowBiasMax, fragNormal_viewSpace,
                       qrk_directionalLights[0].direction);
        // Since we're in u_view space, we have to un-project to world space in order
        // to get to the light's u_view.
        vec4 fragPos_worldSpace = inverse(u_view) * vec4(fragPos_viewSpace, 1.0);
        vec4 fragPos_lightSpace = u_lightViewProjection * fragPos_worldSpace;
        shadow = qrk_shadow(u_shadowMap, fragPos_lightSpace, shadowBias);
    }

    // Ambient occlusion.
    float ao = fragAO;
    if (u_ssao) {
        // Add SSAO and combined with texture based u_ambient occlusion from the
        // G-buffer.
        ao *= texture(qrk_ssao, texCoords).r;
    }

    // Shade with normal lights.
    if (u_lightingModel == 0) {
        // Phong.
        color = qrk_shade_all_lights_blinn_phong_deferred(
                fragAlbedo, /*specular=*/vec3(fragMetallic), u_ambient, u_shininess,
                fragPos_viewSpace, fragNormal_viewSpace, shadow, ao);
    } else if (u_lightingModel == 1) {
        // GGX.
        color = qrk_shade_all_lights_cook_torrance_ggx_deferred(
                fragAlbedo, fragRoughness, fragMetallic, fragPos_viewSpace,
                fragNormal_viewSpace, shadow);
        // Add u_ambient term.
        if (u_useIBL) {
            // Need to sample from cubemaps via worlspace vectors.
            vec3 fragNormal_worldSpace = mat3(transpose(u_view)) * fragNormal_viewSpace;
            vec3 viewDir_worldSpace =
                    mat3(inverse(u_view)) * normalize(-fragPos_viewSpace);
            vec3 reflectionDir_worldSpace =
                    reflect(-viewDir_worldSpace, fragNormal_worldSpace);

            // Sample textures needed for diffuse and specular IBL terms.
            vec3 fragIrradiance =
                    texture(qrk_irradianceMap, normalize(fragNormal_worldSpace)).rgb;
            vec3 prefilteredEnvColor = qrk_sample_prefiltered_env_map(
                    viewDir_worldSpace, fragNormal_worldSpace, fragRoughness,
                    qrk_ggxPrefilteredEnvMap, qrk_ggxPrefilteredEnvMapMaxLOD);
            vec2 envBRDF =
                    qrk_sample_brdf_lut(viewDir_worldSpace, fragNormal_worldSpace,
                                                        fragRoughness, qrk_ggxIntegrationMap);

            color += qrk_shade_ambient_ibl_deferred(
                    fragAlbedo, fragIrradiance, prefilteredEnvColor, envBRDF,
                    fragRoughness, fragMetallic, ao, viewDir_worldSpace,
                    fragNormal_worldSpace);
        } else {
            color += qrk_shade_ambient_deferred(fragAlbedo, u_ambient, ao);
        }
    } else if (u_lightingModel == 2) {
        // 2nd-order SH diffuse irradiance with GGX direct lighting.
        color = qrk_shade_all_lights_cook_torrance_ggx_deferred(
                fragAlbedo, fragRoughness, fragMetallic, fragPos_viewSpace,
                fragNormal_viewSpace, shadow);
        if (u_useIBL) {
            vec3 fragNormal_worldSpace = mat3(transpose(u_view)) * fragNormal_viewSpace;
            vec3 viewDir_worldSpace =
                    mat3(inverse(u_view)) * normalize(-fragPos_viewSpace);
            vec3 reflectionDir_worldSpace =
                    reflect(-viewDir_worldSpace, fragNormal_worldSpace);

            vec3 fragShIrradiance =
                    qrk_evaluate_sh_diffuse_irradiance(fragNormal_worldSpace);
            vec3 prefilteredEnvColor = qrk_sample_prefiltered_env_map(
                    viewDir_worldSpace, fragNormal_worldSpace, fragRoughness,
                    qrk_ggxPrefilteredEnvMap, qrk_ggxPrefilteredEnvMapMaxLOD);
            vec2 envBRDF =
                    qrk_sample_brdf_lut(viewDir_worldSpace, fragNormal_worldSpace,
                                                        fragRoughness, qrk_ggxIntegrationMap);

            color += qrk_shade_ambient_ibl_deferred(
                    fragAlbedo, fragShIrradiance, prefilteredEnvColor, envBRDF,
                    fragRoughness, fragMetallic, ao, viewDir_worldSpace,
                    fragNormal_worldSpace);
        } else {
            color += qrk_shade_ambient_deferred(fragAlbedo, u_ambient, ao);
        }
    } else {
        // Invalid lighting u_model (pink to signal!).
        color = vec3(1.0, 0.0, 0.5);
    }

    // Add emissions.
    color += u_emissionIntensity * qrk_shade_emission_deferred(fragEmission,
                                                         fragPos_viewSpace,
                                                         u_emissionAttenuation);

    fragColor = vec4(color, 1.0);
}
