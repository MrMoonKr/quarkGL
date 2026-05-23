#version 460 core
#pragma qrk_include < gamma.frag>
#pragma qrk_include < tone_mapping.frag>
in vec2 texCoords;

out vec4 fragColor;

uniform sampler2D u_screenTexture;
uniform bool u_useHdr;
uniform int u_toneMapTechnique;
uniform float u_colorStrength = 1.0f;

void main() {
    vec3 color = texture(u_screenTexture, texCoords).rgb;

    color *= u_colorStrength;

    if (u_useHdr) {
        if (u_toneMapTechnique == 0) {
            color = qrk_tone_map_reinhard(color);
        } else if (u_toneMapTechnique == 1) {
            color = qrk_tone_map_reinhard_luminance(color);
        } else if (u_toneMapTechnique == 2) {
            color = qrk_tone_map_aces_approx(color);
        }
    }

    color = qrk_gamma_correct(color);
    fragColor = vec4(color, 1.0);
}
