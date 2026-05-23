#version 460 core
#pragma qrk_include < core.glsl>
#pragma qrk_include < lighting.frag>
#pragma qrk_include < normals.frag>

// Deferred geometry pass fragment shader.

in VS_OUT {
    vec2 texCoords;
    vec3 fragPos_viewSpace;
    vec3 fragNormal_viewSpace;
    mat3 fragTBN_viewSpace;  // Transforms from tangent frame to u_view frame.
}
fs_in;

layout(location = 0) out vec4 u_gPositionAO;
layout(location = 1) out vec4 u_gNormalRoughness;
layout(location = 2) out vec4 u_gAlbedoMetallic;
layout(location = 3) out vec3 u_gEmission;

uniform QrkMaterial u_material;

void main() {
    // Fill the G-Buffer.

    // Map the fragment position and AO.
    u_gPositionAO.rgb = fs_in.fragPos_viewSpace;
    u_gPositionAO.a = qrk_extract_ambient_occlusion(u_material, fs_in.texCoords);
    // Lookup normal and map from tangent space to u_view space. Falls back to
    // vertex normal otherwise.
    u_gNormalRoughness.rgb =
            qrk_get_normal(u_material, fs_in.texCoords, fs_in.fragTBN_viewSpace,
                                        fs_in.fragNormal_viewSpace);
    u_gNormalRoughness.a = qrk_extract_roughness(u_material, fs_in.texCoords);

    u_gAlbedoMetallic.rgb = qrk_extract_albedo(u_material, fs_in.texCoords);
    u_gAlbedoMetallic.a = qrk_extract_metallic(u_material, fs_in.texCoords);

    // We currently don't store anything in the alpha channel.
    u_gEmission = qrk_extract_emission(u_material, fs_in.texCoords);
}
