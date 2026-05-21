file(GLOB EXAMPLE_SOURCES CONFIGURE_DEPENDS "${CMAKE_CURRENT_SOURCE_DIR}/*.cc")

foreach(example_source IN LISTS EXAMPLE_SOURCES)
    get_filename_component(example_name "${example_source}" NAME_WE)

    add_executable(${example_name} "${example_source}")
    target_link_libraries(${example_name} PRIVATE quarkgl)
    quarkgl_apply_executable_settings(${example_name})
    quarkgl_stage_runtime_directory(${example_name} "quarkgl/shaders")
    quarkgl_stage_runtime_directory(${example_name} "examples/shaders")
    quarkgl_stage_runtime_directory(${example_name} "examples/assets")
endforeach()
