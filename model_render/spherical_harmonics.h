#ifndef QUARKGL_MODEL_RENDER_SPHERICAL_HARMONICS_H_
#define QUARKGL_MODEL_RENDER_SPHERICAL_HARMONICS_H_

#include <array>
#include <string>

#include <glm/glm.hpp>

namespace qrk {
class Shader;
}

namespace model_render {

constexpr int kNumShCoefficients = 9;
using ShDiffuseCoefficients = std::array<glm::vec3, kNumShCoefficients>;

ShDiffuseCoefficients calculateDiffuseShCoefficientsFromHdr(
    const std::string& hdrPath );

void setDiffuseShUniforms( qrk::Shader& shader,
                           const ShDiffuseCoefficients& coefficients );

}  // namespace model_render

#endif
