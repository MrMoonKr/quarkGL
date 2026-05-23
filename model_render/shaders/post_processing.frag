#version 460 core
#pragma qrk_include < gamma.frag>
#pragma qrk_include < tone_mapping.frag>

in vec2 texCoords;

out vec4 fragColor;

uniform sampler2D qrk_screenTexture;
uniform sampler2D qrk_bloom;
uniform bool u_bloom;
uniform float u_bloomMix;

uniform int u_toneMapping;
uniform bool u_gammaCorrect;
uniform float u_gamma;

void main() {
    vec3 color = texture(qrk_screenTexture, texCoords).rgb;
    if (u_bloom) {
        vec3 bloomColor = texture(qrk_bloom, texCoords).rgb;
        color = mix(color, bloomColor, u_bloomMix);
    }

    // Perform tone mapping.
    if (u_toneMapping == 1) {
        color = qrk_tone_map_reinhard(color);
    } else if (u_toneMapping == 2) {
        color = qrk_tone_map_reinhard_luminance(color);
    } else if (u_toneMapping == 3) {
        color = qrk_tone_map_aces_approx(color);
    } else if (u_toneMapping == 4) {
        color = qrk_tone_map_amd(color);
    } else {
        // No tone mapping.
    }

    // Perform u_gamma correction.
    if (u_gammaCorrect) {
        color = qrk_gamma_correct(color, u_gamma);
    }

    fragColor = vec4(color, 1.0);
}
