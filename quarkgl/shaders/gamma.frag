#pragma once

#ifndef QUARKGL_GAMMA
#define QUARKGL_GAMMA 2.2
#endif

/**
 * Apply gamma correction to a given color. Can be used after fragment shader
 * lighting to perform gamma correction:
 *
 *   fragColor.rgb = qrk_gamma_correct(fragColor.rgb, 2.2);
 */
vec3 qrk_gamma_correct(vec3 color, float u_gamma) {
    return pow(color, vec3(1.0 / u_gamma));
}

/**
 * Apply gamma correction to a given color. Can be used after fragment shader
 * lighting to perform gamma correction:
 *
 *   fragColor.rgb = qrk_gamma_correct(fragColor.rgb);
 */
vec3 qrk_gamma_correct(vec3 color) {
    return qrk_gamma_correct(color, QUARKGL_GAMMA);
}
