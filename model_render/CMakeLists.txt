add_executable(
    model_render
    "${CMAKE_CURRENT_SOURCE_DIR}/model_render.cc"
    "${CMAKE_CURRENT_SOURCE_DIR}/spherical_harmonics.cc"
)

target_link_libraries(
    model_render
    PRIVATE
        absl::flags
        absl::flags_parse
        absl::flags_usage
        imgui::backend_glfw
        imgui::backend_opengl3
        imgui::imgui
        imguizmo_quat::imguizmo_quat
        quarkgl
)

quarkgl_apply_executable_settings(model_render)
quarkgl_stage_runtime_directory(model_render "quarkgl/shaders")
quarkgl_stage_runtime_directory(model_render "examples/assets")
quarkgl_stage_runtime_directory(model_render "model_render/shaders")
