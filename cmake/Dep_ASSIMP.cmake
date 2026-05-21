include_guard(GLOBAL)

if(TARGET assimp)
    return()
endif()

set(assimp_lib_debug "${CMAKE_SOURCE_DIR}/third_party/assimp/assimp-vc143-mtd.lib")
set(zlib_lib_debug "${CMAKE_SOURCE_DIR}/third_party/assimp/zlibstaticd.lib")

if(NOT EXISTS "${assimp_lib_debug}")
    message(FATAL_ERROR "Missing assimp debug library: ${assimp_lib_debug}")
endif()

if(NOT EXISTS "${zlib_lib_debug}")
    message(FATAL_ERROR "Missing zlib debug library: ${zlib_lib_debug}")
endif()

add_library(assimp_zlib STATIC IMPORTED GLOBAL)
set_target_properties(
    assimp_zlib
    PROPERTIES
        IMPORTED_CONFIGURATIONS DEBUG
        IMPORTED_LOCATION_DEBUG "${zlib_lib_debug}"
)

add_library(assimp STATIC IMPORTED GLOBAL)
add_library(assimp::assimp ALIAS assimp)

set_target_properties(
    assimp
    PROPERTIES
        IMPORTED_CONFIGURATIONS DEBUG
        IMPORTED_LOCATION_DEBUG "${assimp_lib_debug}"
        INTERFACE_INCLUDE_DIRECTORIES "${QUARKGL_GENERATED_INCLUDE_DIR};${CMAKE_SOURCE_DIR}/third_party/assimp/include"
        INTERFACE_LINK_LIBRARIES "assimp_zlib"
    )
