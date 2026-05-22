#version 460 core
#pragma qrk_include < core.glsl>
#pragma qrk_include < normals.frag>
#pragma qrk_include < standard_lights_phong.frag>
#pragma qrk_include < depth.frag>

// An example fragment shader that uses normal mapping.

in VS_OUT {
  vec2 texCoords;
  vec3 fragPos_viewSpace;
  vec3 fragNormal_viewSpace;
  mat3 fragTBN_viewSpace;  // Transforms from tangent frame to u_view frame.
}
fs_in;

out vec4 fragColor;

uniform QrkMaterial u_material;
uniform sampler2D u_normalMap;
uniform bool u_useVertexNormals;
uniform bool u_renderNormals;

void main() {
  // Calculate the normal, either using vertex normals or the normal map.
  vec3 normal_viewSpace;
  if (u_useVertexNormals) {
    normal_viewSpace = normalize(fs_in.fragNormal_viewSpace);
  } else {
    // Lookup normal and map from tangent space to u_view space.
    normal_viewSpace =
        normalize(fs_in.fragTBN_viewSpace *
                  qrk_sampleNormalMap(u_normalMap, fs_in.texCoords));
  }

  // Optionally render normals instead of lighting.
  if (u_renderNormals) {
    fragColor = qrk_normalColor(normal_viewSpace);
    return;
  }

  // Shade with normal lights.
  vec3 result = qrk_shadeAllLightsBlinnPhong(u_material, fs_in.fragPos_viewSpace,
                                             normal_viewSpace, fs_in.texCoords);

  // Add emissions.
  result +=
      qrk_shadeEmission(u_material, fs_in.fragPos_viewSpace, fs_in.texCoords);

  fragColor = vec4(result, qrk_materialAlpha(u_material, fs_in.texCoords));
  fragColor.rgb = qrk_gammaCorrect(fragColor.rgb);
}
