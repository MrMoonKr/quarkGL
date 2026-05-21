cmake_minimum_required(VERSION 3.24)

project(
    quarkgl
    VERSION 1.0.0
    LANGUAGES C CXX
    DESCRIPTION "A subatomic OpenGL graphics library and playground"
)

if(POLICY CMP0091)
    cmake_policy(SET CMP0091 NEW)
endif()

if(POLICY CMP0169)
    cmake_policy(SET CMP0169 OLD)
endif()

set(CMAKE_POLICY_VERSION_MINIMUM 3.5)

if(NOT WIN32)
    message(FATAL_ERROR "This CMake setup currently supports Windows only.")
endif()

set(CMAKE_C_STANDARD 11)
set(CMAKE_C_STANDARD_REQUIRED ON)
set(CMAKE_C_EXTENSIONS OFF)
set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)
set(BUILD_SHARED_LIBS OFF CACHE BOOL "" FORCE)
set(CMAKE_MSVC_RUNTIME_LIBRARY "MultiThreaded$<$<CONFIG:Debug>:Debug>DLL")

if(CMAKE_CONFIGURATION_TYPES)
    set(CMAKE_CONFIGURATION_TYPES "Debug" CACHE STRING "Supported build types" FORCE)
    set_property(CACHE CMAKE_CONFIGURATION_TYPES PROPERTY STRINGS Debug)
endif()

set(CMAKE_ARCHIVE_OUTPUT_DIRECTORY_DEBUG "${CMAKE_SOURCE_DIR}/libs/Debug")
set(CMAKE_LIBRARY_OUTPUT_DIRECTORY_DEBUG "${CMAKE_SOURCE_DIR}/libs/Debug")
set(CMAKE_RUNTIME_OUTPUT_DIRECTORY_DEBUG "${CMAKE_SOURCE_DIR}/bin/Debug")

option(QUARKGL_BUILD_EXAMPLES "Build quarkGL example applications" ON)
option(QUARKGL_BUILD_MODEL_RENDER "Build the model renderer app" ON)
option(QUARKGL_BUILD_TESTS "Build quarkGL tests" OFF)

function(quarkgl_apply_common_target_settings target)
    target_compile_features(${target} PUBLIC cxx_std_20)

    if(MSVC)
        target_compile_options(${target} PRIVATE /utf-8 /Zc:__cplusplus)
    endif()
endfunction()

function(quarkgl_apply_executable_settings target)
    quarkgl_apply_common_target_settings(${target})
    set_target_properties(
        ${target}
        PROPERTIES
            VS_DEBUGGER_WORKING_DIRECTORY "$<TARGET_FILE_DIR:${target}>"
    )

    if(WIN32)
        target_link_libraries(${target} PRIVATE glu32)
    endif()
endfunction()

function(quarkgl_stage_runtime_directory target relative_dir)
    add_custom_command(
        TARGET ${target}
        POST_BUILD
        COMMAND ${CMAKE_COMMAND} -E copy_directory
            "${CMAKE_SOURCE_DIR}/${relative_dir}"
            "$<TARGET_FILE_DIR:${target}>/${relative_dir}"
        VERBATIM
    )
endfunction()

include(cmake/Dependencies.cmake)

quarkgl_prepare_generated_include_tree(QUARKGL_GENERATED_INCLUDE_DIR)

include(cmake/Dep_GLFW.cmake)
include(cmake/Dep_GLAD.cmake)
include(cmake/Dep_GLM.cmake)
include(cmake/Dep_STB.cmake)
include(cmake/Dep_ASSIMP.cmake)
include(cmake/Dep_IMGUI.cmake)
include(cmake/Dep_IMGUIZMO_QUAT.cmake)
include(cmake/Dep_ABSL.cmake)

add_subdirectory(quarkgl)

if(QUARKGL_BUILD_EXAMPLES)
    add_subdirectory(examples)
endif()

if(QUARKGL_BUILD_MODEL_RENDER)
    add_subdirectory(model_render)
endif()

if(TARGET model_render)
    set_property(DIRECTORY PROPERTY VS_STARTUP_PROJECT model_render)
endif()
