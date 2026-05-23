#include "model_render/spherical_harmonics.h"

#include <algorithm>
#include <array>
#include <cmath>
#include <string>

#include <glm/glm.hpp>
#include <quarkgl/shader.h>
#include <quarkgl/texture.h>
#include <stb_image/stb_image.h>

namespace model_render {
namespace {

constexpr float kPi = 3.14159265358979323846f;
constexpr float kTwoPi = 2.0f * kPi;

std::array<float, kNumShCoefficients> evaluateRealShBasis(
    const glm::vec3& direction ) {
    const float x = direction.x;
    const float y = direction.y;
    const float z = direction.z;
    return {
        0.282095f,
        0.488603f * y,
        0.488603f * z,
        0.488603f * x,
        1.092548f * x * y,
        1.092548f * y * z,
        0.315392f * ( 3.0f * z * z - 1.0f ),
        1.092548f * x * z,
        0.546274f * ( x * x - y * y ),
    };
}

}  // namespace

ShDiffuseCoefficients calculateDiffuseShCoefficientsFromHdr(
    const std::string& hdrPath ) {
    int width = 0;
    int height = 0;
    int numChannels = 0;

    stbi_set_flip_vertically_on_load( true );
    float* data =
        stbi_loadf( hdrPath.c_str(), &width, &height, &numChannels, 0 );
    if ( data == nullptr ) {
        throw qrk::TextureException( "ERROR::TEXTURE::LOAD_FAILED\n" +
                                     hdrPath );
    }

    std::array<glm::dvec3, kNumShCoefficients> projectedCoefficients;
    projectedCoefficients.fill( glm::dvec3( 0.0 ) );

    const float dPhi = kTwoPi / static_cast<float>( width );
    const float dTheta = kPi / static_cast<float>( height );

    for ( int y = 0; y < height; ++y ) {
        const float v =
            ( static_cast<float>( y ) + 0.5f ) / static_cast<float>( height );
        const float latitude = ( v - 0.5f ) * kPi;
        const float sinLatitude = std::sin( latitude );
        const float cosLatitude = std::cos( latitude );
        const float dOmega = dPhi * dTheta * cosLatitude;

        for ( int x = 0; x < width; ++x ) {
            const float u = ( static_cast<float>( x ) + 0.5f ) /
                            static_cast<float>( width );
            const float longitude = ( u - 0.5f ) * kTwoPi;

            const glm::vec3 direction =
                glm::normalize( glm::vec3( cosLatitude * std::cos( longitude ),
                                           sinLatitude,
                                           cosLatitude *
                                               std::sin( longitude ) ) );
            const auto basis = evaluateRealShBasis( direction );

            const int pixelOffset = ( y * width + x ) * numChannels;
            glm::dvec3 radiance(
                data[ pixelOffset ],
                data[ pixelOffset + std::min( 1, numChannels - 1 ) ],
                data[ pixelOffset + std::min( 2, numChannels - 1 ) ] );

            for ( int coeffIdx = 0; coeffIdx < kNumShCoefficients;
                  ++coeffIdx ) {
                projectedCoefficients[ coeffIdx ] +=
                    radiance * static_cast<double>( basis[ coeffIdx ] *
                                                    dOmega );
            }
        }
    }

    stbi_image_free( data );

    constexpr std::array<float, kNumShCoefficients>
        kDiffuseConvolutionKernel = {
            kPi,         2.0f * kPi / 3.0f, 2.0f * kPi / 3.0f,
            2.0f * kPi / 3.0f, kPi / 4.0f,  kPi / 4.0f,
            kPi / 4.0f,  kPi / 4.0f,        kPi / 4.0f,
        };

    ShDiffuseCoefficients diffuseCoefficients;
    for ( int coeffIdx = 0; coeffIdx < kNumShCoefficients; ++coeffIdx ) {
        diffuseCoefficients[ coeffIdx ] =
            glm::vec3( projectedCoefficients[ coeffIdx ] *
                       static_cast<double>(
                           kDiffuseConvolutionKernel[ coeffIdx ] ) );
    }
    return diffuseCoefficients;
}

void setDiffuseShUniforms( qrk::Shader& shader,
                           const ShDiffuseCoefficients& coefficients ) {
    for ( int coeffIdx = 0; coeffIdx < kNumShCoefficients; ++coeffIdx ) {
        shader.setVec3( "u_shDiffuseCoefficients[" +
                            std::to_string( coeffIdx ) + "]",
                        coefficients[ coeffIdx ] );
    }
}

}  // namespace model_render
