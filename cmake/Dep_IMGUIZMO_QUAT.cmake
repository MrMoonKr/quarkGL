include_guard(GLOBAL)

if(TARGET imguizmo_quat)
    return()
endif()

add_library(
    imguizmo_quat STATIC
    "${CMAKE_SOURCE_DIR}/third_party/imguizmo_quat/imGuIZMOquat.cpp"
)
add_library(imguizmo_quat::imguizmo_quat ALIAS imguizmo_quat)

target_include_directories(
    imguizmo_quat
    PUBLIC
        "${CMAKE_SOURCE_DIR}/third_party/imguizmo_quat"
)

target_link_libraries(
    imguizmo_quat
    PUBLIC
        glm::glm
        imgui::imgui
)

quarkgl_apply_common_target_settings(imguizmo_quat)
