#version 460 core
#define QRK_MAX_POINT_LIGHTS 32
#pragma qrk_include < gamma.frag>
#pragma qrk_include < tone_mapping.frag>
#pragma qrk_include < standard_lights_pbr.frag>
#pragma qrk_include < lighting.frag>
in vec2 texCoords;

out vec4 fragColor;

uniform sampler2D u_gPositionAO;
uniform sampler2D u_gNormalRoughness;
uniform sampler2D u_gAlbedoMetallic;
uniform sampler2D u_gEmission;

uniform vec3 u_ambient;
uniform float u_emissionStrength;
uniform QrkAttenuation u_emissionAttenuation;

void main() {
  // Extract G-Buffer for PBR rendering.
  vec3 fragPos_viewSpace = texture(u_gPositionAO, texCoords).rgb;
  float fragAO = texture(u_gPositionAO, texCoords).a;
  vec3 fragNormal_viewSpace = texture(u_gNormalRoughness, texCoords).rgb;
  float fragRoughness = texture(u_gNormalRoughness, texCoords).a;
  vec3 fragAlbedo = texture(u_gAlbedoMetallic, texCoords).rgb;
  float fragMetallic = texture(u_gAlbedoMetallic, texCoords).a;
  vec3 fragEmission = texture(u_gEmission, texCoords).rgb;

  // Shade with normal lights.
  vec3 color = qrk_shadeAllLightsCookTorranceGGXDeferred(
      fragAlbedo, fragRoughness, fragMetallic, fragPos_viewSpace,
      fragNormal_viewSpace);

  color += qrk_shadeAmbientDeferred(fragAlbedo, u_ambient, /*ao=*/1.0);

  // Add emissions.
  color += qrk_shadeEmissionDeferred(fragEmission * u_emissionStrength,
                                     fragPos_viewSpace, u_emissionAttenuation);

  color = qrk_toneMapAcesApprox(color);
  color = qrk_gammaCorrect(color);
  fragColor = vec4(color, 1.0);
}
