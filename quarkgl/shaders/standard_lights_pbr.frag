#pragma once

#pragma qrk_include < lighting.frag>
#pragma qrk_include < pbr.frag>
#pragma qrk_include < standard_lights.frag>

/** ============================ PBR ============================ **/

/**
 * Calculate shading from all active directional lights.
 * TODO: Accepting shadow here is incorrect, as each light should have its own
 * shadow (or lack thereof, if shadow maps aren't enabled for it). This only
 * works when there's 1 light.
 */
vec3 qrk_shadeAllDirectionalLightsCookTorranceGGX(QrkMaterial u_material,
                                                  vec3 fragPos, vec3 normal,
                                                  vec2 texCoords,
                                                  float shadow) {
  vec3 result = vec3(0.0);
  for (int i = 0; i < qrk_directionalLightCount; i++) {
    result += qrk_shadeDirectionalLightCookTorranceGGX(
        u_material, qrk_directionalLights[i], fragPos, normal, texCoords, shadow);
  }
  return result;
}

/** Calculate shading from all active directional lights using deferred data. */
vec3 qrk_shadeAllDirectionalLightsCookTorranceGGXDeferred(
    vec3 albedo, float u_roughness, float u_metallic, vec3 fragPos, vec3 normal,
    float shadow) {
  vec3 result = vec3(0.0);
  for (int i = 0; i < qrk_directionalLightCount; i++) {
    result += qrk_shadeDirectionalLightCookTorranceGGXDeferred(
        albedo, u_roughness, u_metallic, qrk_directionalLights[i], fragPos, normal,
        shadow);
  }
  return result;
}

/** Calculate shading from all active point lights. */
vec3 qrk_shadeAllPointLightsCookTorranceGGX(QrkMaterial u_material, vec3 fragPos,
                                            vec3 normal, vec2 texCoords) {
  vec3 result = vec3(0.0);
  for (int i = 0; i < qrk_pointLightCount; i++) {
    result += qrk_shadePointLightCookTorranceGGX(u_material, qrk_pointLights[i],
                                                 fragPos, normal, texCoords);
  }
  return result;
}

/** Calculate shading from all active point lights using deferred data. */
vec3 qrk_shadeAllPointLightsCookTorranceGGXDeferred(vec3 albedo,
                                                    float u_roughness,
                                                    float u_metallic,
                                                    vec3 fragPos, vec3 normal) {
  vec3 result = vec3(0.0);
  for (int i = 0; i < qrk_pointLightCount; i++) {
    result += qrk_shadePointLightCookTorranceGGXDeferred(
        albedo, u_roughness, u_metallic, qrk_pointLights[i], fragPos, normal);
  }
  return result;
}

/** Calculate shading from all active spot lights. */
vec3 qrk_shadeAllSpotLightsCookTorranceGGX(QrkMaterial u_material, vec3 fragPos,
                                           vec3 normal, vec2 texCoords) {
  vec3 result = vec3(0.0);
  for (int i = 0; i < qrk_spotLightCount; i++) {
    result += qrk_shadeSpotLightCookTorranceGGX(u_material, qrk_spotLights[i],
                                                fragPos, normal, texCoords);
  }
  return result;
}

/** Calculate shading from all active spot lights using deferred data. */
vec3 qrk_shadeAllSpotLightsCookTorranceGGXDeferred(vec3 albedo, float u_roughness,
                                                   float u_metallic, vec3 fragPos,
                                                   vec3 normal) {
  vec3 result = vec3(0.0);
  for (int i = 0; i < qrk_spotLightCount; i++) {
    result += qrk_shadeSpotLightCookTorranceGGXDeferred(
        albedo, u_roughness, u_metallic, qrk_spotLights[i], fragPos, normal);
  }
  return result;
}

/**
 * Calculate shading from all light sources, except u_ambient and emission
 * textures.
 */
vec3 qrk_shadeAllLightsCookTorranceGGX(QrkMaterial u_material, vec3 fragPos,
                                       vec3 normal, vec2 texCoords,
                                       float shadow) {
  vec3 albedo = qrk_extractAlbedo(u_material, texCoords);

  vec3 directional = qrk_shadeAllDirectionalLightsCookTorranceGGX(
      u_material, fragPos, normal, texCoords, shadow);
  vec3 point = qrk_shadeAllPointLightsCookTorranceGGX(u_material, fragPos, normal,
                                                      texCoords);
  vec3 spot = qrk_shadeAllSpotLightsCookTorranceGGX(u_material, fragPos, normal,
                                                    texCoords);
  return directional + point + spot;
}

vec3 qrk_shadeAllLightsCookTorranceGGX(QrkMaterial u_material, vec3 fragPos,
                                       vec3 normal, vec2 texCoords) {
  return qrk_shadeAllLightsCookTorranceGGX(u_material, fragPos, normal, texCoords,
                                           /*shadow=*/0.0);
}

/**
 * Calculate shading from all light sources, except u_ambient and emission
 * textures, using deferred data.
 * AO can be a mix of AO textures and SSAO, but the mixing should be handled by
 * the caller.
 */
vec3 qrk_shadeAllLightsCookTorranceGGXDeferred(vec3 albedo, float u_roughness,
                                               float u_metallic, vec3 fragPos,
                                               vec3 normal, float shadow) {
  vec3 directional = qrk_shadeAllDirectionalLightsCookTorranceGGXDeferred(
      albedo, u_roughness, u_metallic, fragPos, normal, shadow);
  vec3 point = qrk_shadeAllPointLightsCookTorranceGGXDeferred(
      albedo, u_roughness, u_metallic, fragPos, normal);
  vec3 spot = qrk_shadeAllSpotLightsCookTorranceGGXDeferred(
      albedo, u_roughness, u_metallic, fragPos, normal);
  return directional + point + spot;
}

vec3 qrk_shadeAllLightsCookTorranceGGXDeferred(vec3 albedo, float u_roughness,
                                               float u_metallic, vec3 fragPos,
                                               vec3 normal) {
  return qrk_shadeAllLightsCookTorranceGGXDeferred(albedo, u_roughness, u_metallic,
                                                   fragPos, normal,
                                                   /*shadow=*/0.0);
}