#pragma once

#pragma qrk_include < constants.glsl>
#pragma qrk_include < lighting.frag>

/**
 * Calculate the deferred Blinn-Phong shading u_model with u_ambient, diffuse, and
 * specular components, along with direct u_material colors. Does not include
 * attenuation.
 */
vec3 qrk_shade_blinn_phong_deferred(vec3 albedo, vec3 specular, vec3 u_ambient,
                                 float u_shininess, vec3 lightDiffuse,
                                 vec3 lightSpecular, vec3 lightDir,
                                 vec3 viewDir, vec3 normal, float intensity,
                                 float shadow, float ao) {
    vec3 result = vec3(0.0);
    float shadowMultiplier = 1.0 - shadow;

    // Ambient and diffuse components.
    float diffuseIntensity = max(dot(normal, lightDir), 0.0);
    // Ambient component. Don't include shadow calculation here, since it
    // shouldn't affect u_ambient light, but do include AO.
    // TODO: Ambient should not be here, as this is a per-light term. Removing it
    // will allow also extracting (spotlight)intensity, shadow, and u_ambient
    // occlusion params.
    result += u_ambient * albedo * ao;

    // Diffuse component.
    result +=
            lightDiffuse * diffuseIntensity * albedo * intensity * shadowMultiplier;

    // Specular component.
    vec3 halfwayDir = normalize(lightDir + viewDir);
    float specularIntensity = pow(max(dot(normal, halfwayDir), 0.0), u_shininess);
    result += lightSpecular * specularIntensity * specular * intensity *
                        shadowMultiplier;

    return result;
}

/**
 * Calculate the Blinn-Phong shading u_model with u_ambient, diffuse, and specular
 * components. Does not include attenuation.
 */
vec3 qrk_shade_blinn_phong(QrkMaterial u_material, vec3 lightDiffuse,
                         vec3 lightSpecular, vec3 lightDir, vec3 viewDir,
                         vec3 normal, vec2 texCoords, float intensity,
                         float shadow, float ao) {
    vec3 albedo = qrk_extract_albedo(u_material, texCoords);
    vec3 specular = qrk_extract_specular(u_material, texCoords);
    // Use the deferred calculations, but do it directly, so it's not deferred.
    // :)
    return qrk_shade_blinn_phong_deferred(
            albedo, specular, u_material.u_ambient, u_material.u_shininess, lightDiffuse,
            lightSpecular, lightDir, viewDir, normal, intensity, shadow, ao);
}

/** Calculate shading for a directional light source using deferred data. */
vec3 qrk_shade_directional_light_blinn_phong_deferred(vec3 albedo, vec3 specular,
                                                 vec3 u_ambient, float u_shininess,
                                                 QrkDirectionalLight light,
                                                 vec3 fragPos, vec3 normal,
                                                 float shadow, float ao) {
    vec3 lightDir = normalize(-light.direction);
    vec3 viewDir = normalize(-fragPos);

    return qrk_shade_blinn_phong_deferred(
            albedo, specular, u_ambient, u_shininess, light.diffuse, light.specular,
            lightDir, viewDir, normal, /*intensity=*/1.0, shadow, ao);
}

/** Calculate shading for a directional light source. */
vec3 qrk_shade_directional_light_blinn_phong(QrkMaterial u_material,
                                         QrkDirectionalLight light,
                                         vec3 fragPos, vec3 normal,
                                         vec2 texCoords, float shadow,
                                         float ao) {
    vec3 albedo = qrk_extract_albedo(u_material, texCoords);
    vec3 specular = qrk_extract_specular(u_material, texCoords);
    return qrk_shade_directional_light_blinn_phong_deferred(
            albedo, specular, u_material.u_ambient, u_material.u_shininess, light, fragPos,
            normal, shadow, ao);
}

/** Calculate shading for a point light source using deferred data. */
vec3 qrk_shade_point_light_blinn_phong_deferred(vec3 albedo, vec3 specular,
                                           vec3 u_ambient, float u_shininess,
                                           QrkPointLight light, vec3 fragPos,
                                           vec3 normal, float ao) {
    vec3 lightDir = normalize(light.position - fragPos);
    vec3 viewDir = normalize(-fragPos);

    // Calculate attenuation from light source.
    float lightDist = length(light.position - fragPos);
    float attenuation = qrk_calc_attenuation(light.attenuation, lightDist);

    vec3 result = qrk_shade_blinn_phong_deferred(
            albedo, specular, u_ambient, u_shininess, light.diffuse, light.specular,
            lightDir, viewDir, normal, /*intensity=*/1.0, /*shadow=*/0.0, ao);
    // Apply attenuation.
    return result * attenuation;
}

/** Calculate shading for a point light source. */
vec3 qrk_shade_point_light_blinn_phong(QrkMaterial u_material, QrkPointLight light,
                                   vec3 fragPos, vec3 normal, vec2 texCoords,
                                   float ao) {
    vec3 albedo = qrk_extract_albedo(u_material, texCoords);
    vec3 specular = qrk_extract_specular(u_material, texCoords);
    return qrk_shade_point_light_blinn_phong_deferred(
            albedo, specular, u_material.u_ambient, u_material.u_shininess, light, fragPos,
            normal, ao);
}

/** Calculate shading for a spot light source using deferred data. */
vec3 qrk_shade_spot_light_blinn_phong_deferred(vec3 albedo, vec3 specular,
                                                                                    vec3 u_ambient, float u_shininess,
                                                                                    QrkSpotLight light, vec3 fragPos,
                                                                                    vec3 normal, float ao) {
    vec3 lightDir = normalize(light.position - fragPos);
    vec3 viewDir = normalize(-fragPos);

    // Calculate attenuation from light source.
    float lightDist = length(light.position - fragPos);
    float attenuation = qrk_calc_attenuation(light.attenuation, lightDist);

    float intensity = qrk_calc_spot_light_intensity(light, lightDir);

    vec3 result = qrk_shade_blinn_phong_deferred(
            albedo, specular, u_ambient, u_shininess, light.diffuse, light.specular,
            lightDir, viewDir, normal, intensity, /*shadow=*/0.0, ao);
    // Apply attenuation.
    return result * attenuation;
}

/** Calculate shading for a spot light source. */
vec3 qrk_shade_spot_light_blinn_phong(QrkMaterial u_material, QrkSpotLight light,
                                                                    vec3 fragPos, vec3 normal, vec2 texCoords,
                                                                    float ao) {
    vec3 albedo = qrk_extract_albedo(u_material, texCoords);
    vec3 specular = qrk_extract_specular(u_material, texCoords);
    return qrk_shade_spot_light_blinn_phong_deferred(
            albedo, specular, u_material.u_ambient, u_material.u_shininess, light, fragPos,
            normal, ao);
}
