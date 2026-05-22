include_guard(GLOBAL)

if(TARGET stb_image)
    return()
endif()

add_library(stb_image STATIC "${CMAKE_SOURCE_DIR}/third_party/stb_image/stb_image.cc")
add_library(stb::stb_image ALIAS stb_image)

target_include_directories(
    stb_image
    PUBLIC
        "${CMAKE_SOURCE_DIR}/third_party"
)

quarkgl_apply_common_target_settings(stb_image)
