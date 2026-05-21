include_guard(GLOBAL)

if(TARGET imgui)
    return()
endif()

add_library(
    imgui STATIC
    "${CMAKE_SOURCE_DIR}/third_party/imgui/imgui.cpp"
    "${CMAKE_SOURCE_DIR}/third_party/imgui/imgui_demo.cpp"
    "${CMAKE_SOURCE_DIR}/third_party/imgui/imgui_draw.cpp"
    "${CMAKE_SOURCE_DIR}/third_party/imgui/imgui_tables.cpp"
    "${CMAKE_SOURCE_DIR}/third_party/imgui/imgui_widgets.cpp"
)
add_library(imgui::imgui ALIAS imgui)

target_include_directories(
    imgui
    PUBLIC
        "${CMAKE_SOURCE_DIR}/third_party/imgui"
        "${CMAKE_SOURCE_DIR}/third_party/imgui/backends"
)

target_link_libraries(imgui PUBLIC glm::glm)

add_library(
    imgui_backend_glfw STATIC
    "${CMAKE_SOURCE_DIR}/third_party/imgui/backends/imgui_impl_glfw.cpp"
)
add_library(imgui::backend_glfw ALIAS imgui_backend_glfw)

target_link_libraries(
    imgui_backend_glfw
    PUBLIC
        imgui::imgui
        glfw
)

add_library(
    imgui_backend_opengl3 STATIC
    "${CMAKE_SOURCE_DIR}/third_party/imgui/backends/imgui_impl_opengl3.cpp"
)
add_library(imgui::backend_opengl3 ALIAS imgui_backend_opengl3)

target_link_libraries(
    imgui_backend_opengl3
    PUBLIC
        imgui::imgui
)

quarkgl_apply_common_target_settings(imgui)
quarkgl_apply_common_target_settings(imgui_backend_glfw)
quarkgl_apply_common_target_settings(imgui_backend_opengl3)
