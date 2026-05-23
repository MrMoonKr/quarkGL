#pragma once

#pragma qrk_include < lighting.frag>
#pragma qrk_include < phong.frag>
#pragma qrk_include < standard_lights.frag>

/** Calculate shading from all active directional lights. */
vec3 qrk_shade_all_directional_lights_blinn_phong(QrkMaterial u_material, vec3 fragPos,
                                             vec3 normal, vec2 texCoords,
                                             float shadow, float ao) {
    vec3 result = vec3(0.0);
    for (int i = 0; i < qrk_directionalLightCount; i++) {
        result += qrk_shade_directional_light_blinn_phong(
                u_material, qrk_directionalLights[i], fragPos, normal, texCoords, shadow,
                ao);
    }
    return result;
}

/** Calculate shading from all active directional lights using deferred data. */
vec3 qrk_shade_all_directional_lights_blinn_phong_deferred(vec3 albedo, vec3 specular,
                                                     vec3 u_ambient,
                                                     float u_shininess,
                                                     vec3 fragPos, vec3 normal,
                                                     float shadow, float ao) {
    vec3 result = vec3(0.0);
    for (int i = 0; i < qrk_directionalLightCount; i++) {
        result += qrk_shade_directional_light_blinn_phong_deferred(
                albedo, specular, u_ambient, u_shininess, qrk_directionalLights[i], fragPos,
                normal, shadow, ao);
    }
    return result;
}

/** Calculate shading from all active point lights. */
vec3 qrk_shade_all_point_lights_blinn_phong(QrkMaterial u_material, vec3 fragPos,
                                       vec3 normal, vec2 texCoords, float ao) {
    vec3 result = vec3(0.0);
    for (int i = 0; i < qrk_pointLightCount; i++) {
        result += qrk_shade_point_light_blinn_phong(u_material, qrk_pointLights[i],
                                                                                        fragPos, normal, texCoords, ao);
    }
    return result;
}

/** Calculate shading from all active point lights using deferred data. */
vec3 qrk_shade_all_point_lights_blinn_phong_deferred(vec3 albedo, vec3 specular,
                                               vec3 u_ambient, float u_shininess,
                                               vec3 fragPos, vec3 normal,
                                               float ao) {
    vec3 result = vec3(0.0);
    for (int i = 0; i < qrk_pointLightCount; i++) {
        result += qrk_shade_point_light_blinn_phong_deferred(
                albedo, specular, u_ambient, u_shininess, qrk_pointLights[i], fragPos,
                normal, ao);
    }
    return result;
}

/** Calculate shading from all active spot lights. */
vec3 qrk_shade_all_spot_lights_blinn_phong(QrkMaterial u_material, vec3 fragPos,
                                                                            vec3 normal, vec2 texCoords, float ao) {
    vec3 result = vec3(0.0);
    for (int i = 0; i < qrk_spotLightCount; i++) {
        result += qrk_shade_spot_light_blinn_phong(u_material, qrk_spotLights[i], fragPos,
                                           normal, texCoords, ao);
    }
    return result;
}

/** Calculate shading from all active spot lights using deferred data. */
vec3 qrk_shade_all_spot_lights_deferred_blinn_phong(vec3 albedo, vec3 specular,
                                                                                            vec3 u_ambient, float u_shininess,
                                                                                            vec3 fragPos, vec3 normal,
                                                                                            float ao) {
    vec3 result = vec3(0.0);
    for (int i = 0; i < qrk_spotLightCount; i++) {
        result += qrk_shade_spot_light_blinn_phong_deferred(albedo, specular, u_ambient,
                                                   u_shininess, qrk_spotLights[i],
                                                   fragPos, normal, ao);
    }
    return result;
}

/** Calculate shading from all light sources, except emission textures. */
vec3 qrk_shade_all_lights_blinn_phong(QrkMaterial u_material, vec3 fragPos,
                                                                    vec3 normal, vec2 texCoords, float shadow,
                                                                    float ao) {
    vec3 directional = qrk_shade_all_directional_lights_blinn_phong(
            u_material, fragPos, normal, texCoords, shadow, ao);
    vec3 point = qrk_shade_all_point_lights_blinn_phong(u_material, fragPos, normal,
                                                 texCoords, ao);
    vec3 spot = qrk_shade_all_spot_lights_blinn_phong(u_material, fragPos, normal,
                                               texCoords, ao);
    return directional + point + spot;
}

vec3 qrk_shade_all_lights_blinn_phong(QrkMaterial u_material, vec3 fragPos,
                                                                    vec3 normal, vec2 texCoords) {
    return qrk_shade_all_lights_blinn_phong(u_material, fragPos, normal, texCoords,
                                                                            /*shadow=*/0.0, /*ao=*/1.0);
}

/** Calculate shading from all light sources, except emission textures, using
 * deferred data. */
vec3 qrk_shade_all_lights_blinn_phong_deferred(vec3 albedo, vec3 specular,
                                                                                    vec3 u_ambient, float u_shininess,
                                                                                    vec3 fragPos, vec3 normal,
                                                                                    float shadow, float ao) {
    vec3 directional = qrk_shade_all_directional_lights_blinn_phong_deferred(
            albedo, specular, u_ambient, u_shininess, fragPos, normal, shadow, ao);
    vec3 point = qrk_shade_all_point_lights_blinn_phong_deferred(
            albedo, specular, u_ambient, u_shininess, fragPos, normal, ao);
    vec3 spot = qrk_shade_all_spot_lights_deferred_blinn_phong(
            albedo, specular, u_ambient, u_shininess, fragPos, normal, ao);
    return directional + point + spot;
}

vec3 qrk_shade_all_lights_blinn_phong_deferred(vec3 albedo, vec3 specular,
                                                                                    vec3 u_ambient, float u_shininess,
                                                                                    vec3 fragPos, vec3 normal) {
    return qrk_shade_all_lights_blinn_phong_deferred(albedo, specular, u_ambient,
                                                                                            u_shininess, fragPos, normal,
                                                                                            /*shadow=*/0.0, /*ao=*/1.0);
}
