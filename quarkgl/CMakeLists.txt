file(GLOB QUARKGL_HEADERS CONFIGURE_DEPENDS "${CMAKE_CURRENT_SOURCE_DIR}/*.h")
file(GLOB QUARKGL_SOURCES CONFIGURE_DEPENDS "${CMAKE_CURRENT_SOURCE_DIR}/*.cc")

list(REMOVE_ITEM QUARKGL_SOURCES "${CMAKE_CURRENT_SOURCE_DIR}/texture_test.cc")

add_library(quarkgl STATIC ${QUARKGL_HEADERS} ${QUARKGL_SOURCES})

target_include_directories(
    quarkgl
    PUBLIC
        "${QUARKGL_GENERATED_INCLUDE_DIR}"
)

target_link_libraries(
    quarkgl
    PUBLIC
        assimp::assimp
        glad::glad
        glfw
        glm::glm
        stb::stb_image
)

quarkgl_apply_common_target_settings(quarkgl)
