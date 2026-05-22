#version 460 core
#pragma qrk_include < gamma.frag>
#pragma qrk_include < tone_mapping.frag>
in vec2 texCoords;

out vec4 fragColor;

uniform sampler2D u_screenTexture;
uniform sampler2D u_bloomTexture;
uniform bool u_useBloom;
uniform bool u_interpolateBloom;
uniform float u_bloomStrength;

void main() {
  vec3 color = texture(u_screenTexture, texCoords).rgb;
  if (u_useBloom) {
    vec3 bloomColor = texture(u_bloomTexture, texCoords).rgb;
    if (u_interpolateBloom) {
      color = mix(color, bloomColor, u_bloomStrength);
    } else {
      color += bloomColor;
    }
  }

  color = qrk_toneMapAMD(color);
  color = qrk_gammaCorrect(color);
  fragColor = vec4(color, 1.0);
}
