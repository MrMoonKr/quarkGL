include_guard(GLOBAL)

if(TARGET glad)
    return()
endif()

add_library(glad STATIC "${CMAKE_SOURCE_DIR}/third_party/glad/glad.c")
add_library(glad::glad ALIAS glad)

target_include_directories(
    glad
    PUBLIC
        "${CMAKE_SOURCE_DIR}/third_party"
        "${QUARKGL_GENERATED_INCLUDE_DIR}"
)

target_link_libraries(glad PUBLIC opengl32)

quarkgl_apply_common_target_settings(glad)
