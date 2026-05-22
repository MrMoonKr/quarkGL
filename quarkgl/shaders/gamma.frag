#pragma once

#ifndef QUARKGL_GAMMA
#define QUARKGL_GAMMA 2.2
#endif

/**
 * Apply u_gamma correction to a given color. Can be used after fragment shader
 * lighting to perform u_gamma correction:
 *
 *   fragColor.rgb = qrk_gammaCorrect(fragColor.rgb, 2.2);
 */
vec3 qrk_gammaCorrect(vec3 color, float u_gamma) {
  return pow(color, vec3(1.0 / u_gamma));
}

/**
 * Apply u_gamma correction to a given color. Can be used after fragment shader
 * lighting to perform u_gamma correction:
 *
 *   fragColor.rgb = qrk_gammaCorrect(fragColor.rgb);
 */
vec3 qrk_gammaCorrect(vec3 color) {
  return qrk_gammaCorrect(color, QUARKGL_GAMMA);
}