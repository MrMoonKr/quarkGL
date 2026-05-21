include_guard(GLOBAL)

include(FetchContent)

set(FETCHCONTENT_BASE_DIR "${CMAKE_BINARY_DIR}/_deps" CACHE PATH "FetchContent base directory" FORCE)
set(FETCHCONTENT_UPDATES_DISCONNECTED OFF CACHE BOOL "" FORCE)

function(dep_resolve_paths name out_source_dir out_binary_dir)
    set(dep_source_dir "${CMAKE_SOURCE_DIR}/deps/${name}-src")
    set(dep_binary_dir "${CMAKE_BINARY_DIR}/_deps/${name}-build")

    set(${out_source_dir} "${dep_source_dir}" PARENT_SCOPE)
    set(${out_binary_dir} "${dep_binary_dir}" PARENT_SCOPE)
endfunction()

function(dep_declare_fetchcontent name git_repository git_tag source_dir binary_dir)
    FetchContent_Declare(
        ${name}
        GIT_REPOSITORY ${git_repository}
        GIT_TAG ${git_tag}
        SOURCE_DIR "${source_dir}"
        BINARY_DIR "${binary_dir}"
    )
endfunction()

function(quarkgl_prepare_generated_include_tree out_dir)
    set(generated_include_dir "${CMAKE_BINARY_DIR}/generated_include")

    file(MAKE_DIRECTORY
        "${generated_include_dir}/KHR"
        "${generated_include_dir}/qrk"
        "${generated_include_dir}/stb"
        "${generated_include_dir}/assimp"
    )

    file(GLOB quarkgl_public_headers CONFIGURE_DEPENDS
        "${CMAKE_SOURCE_DIR}/quarkgl/*.h"
    )
    foreach(header IN LISTS quarkgl_public_headers)
        get_filename_component(header_name "${header}" NAME)
        configure_file(
            "${header}"
            "${generated_include_dir}/qrk/${header_name}"
            COPYONLY
        )
    endforeach()

    configure_file(
        "${CMAKE_SOURCE_DIR}/third_party/khrplatform/khrplatform.h"
        "${generated_include_dir}/KHR/khrplatform.h"
        COPYONLY
    )

    configure_file(
        "${CMAKE_SOURCE_DIR}/third_party/stb_image/stb_image.h"
        "${generated_include_dir}/stb/stb_image.h"
        COPYONLY
    )

    file(READ "${CMAKE_SOURCE_DIR}/third_party/assimp/include/assimp/config.h.in" assimp_config_template)
    string(REPLACE "#cmakedefine" "// #undef" assimp_config_header "${assimp_config_template}")
    file(WRITE "${generated_include_dir}/assimp/config.h" "${assimp_config_header}")

    set(${out_dir} "${generated_include_dir}" PARENT_SCOPE)
endfunction()
