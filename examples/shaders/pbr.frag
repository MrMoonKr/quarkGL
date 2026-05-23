#version 460 core
#pragma qrk_include < core.glsl>
#pragma qrk_include < normals.frag>
#pragma qrk_include < standard_lights_phong.frag>
#pragma qrk_include < standard_lights_pbr.frag>
#pragma qrk_include < gamma.frag>
#pragma qrk_include < tone_mapping.frag>

// An example fragment shader with PBR illumination.

in VS_OUT {
    vec2 texCoords;
    vec3 fragPos_viewSpace;
    vec3 fragNormal_viewSpace;
    mat3 fragTBN_viewSpace;  // Transforms from tangent frame to u_view frame.
}
fs_in;

uniform vec3 u_baseColor;
uniform float u_metallic;
uniform float u_roughness;
uniform bool u_usePBR;
uniform bool u_useTextures;

out vec4 fragColor;

uniform QrkMaterial u_material;

void main() {
    // Lookup normal and map from tangent space to u_view space.
    vec3 normal_viewSpace =
            qrk_get_normal(u_material, fs_in.texCoords, fs_in.fragTBN_viewSpace,
                                        fs_in.fragNormal_viewSpace);

    vec3 result;
    // Shade with normal lights.
    if (u_usePBR) {
        if (u_useTextures) {
            result = qrk_shade_all_lights_cook_torrance_ggx(
                    u_material, fs_in.fragPos_viewSpace, normal_viewSpace, fs_in.texCoords);
            result += qrk_shade_ambient(u_material, u_baseColor, fs_in.texCoords);
        } else {
            // Even though we aren't using deferred shading, we can use the function
            // to pass colors directly and avoid textures.
            result = qrk_shade_all_lights_cook_torrance_ggx_deferred(
                    /*albedo=*/u_baseColor, u_roughness, u_metallic, fs_in.fragPos_viewSpace,
                    normal_viewSpace);
            result +=
                    qrk_shade_ambient_deferred(u_baseColor, u_material.u_ambient, /*ao=*/1.0);
        }
    } else {
        if (u_useTextures) {
            result = qrk_shade_all_lights_blinn_phong(u_material, fs_in.fragPos_viewSpace,
                                                                                        normal_viewSpace, fs_in.texCoords);
        } else {
            // Even though we aren't using deferred shading, we can use the function
            // to pass colors directly and avoid textures.
            result = qrk_shade_all_lights_blinn_phong_deferred(
                    /*albedo=*/u_baseColor, /*specular=*/vec3(0.5), u_material.u_ambient,
                    u_material.u_shininess, fs_in.fragPos_viewSpace, normal_viewSpace);
        }
    }

    // Add emissions.
    result +=
            qrk_shade_emission(u_material, fs_in.fragPos_viewSpace, fs_in.texCoords);

    fragColor = vec4(result, qrk_material_alpha(u_material, fs_in.texCoords));

    fragColor.rgb = qrk_tone_map_reinhard(fragColor.rgb);
    fragColor.rgb = qrk_gamma_correct(fragColor.rgb);
}
