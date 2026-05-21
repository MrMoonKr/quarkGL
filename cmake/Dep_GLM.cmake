include_guard(GLOBAL)

if(TARGET glm)
    return()
endif()

add_library(glm INTERFACE)
add_library(glm::glm ALIAS glm)

target_include_directories(glm INTERFACE "${CMAKE_SOURCE_DIR}/third_party")
