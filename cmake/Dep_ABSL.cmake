include_guard(GLOBAL)

include(cmake/Dependencies.cmake)

if(TARGET absl::flags)
    return()
endif()

dep_resolve_paths("absl" dep_source_dir dep_binary_dir)

set(ABSL_PROPAGATE_CXX_STD ON CACHE BOOL "" FORCE)
set(ABSL_ENABLE_INSTALL OFF CACHE BOOL "" FORCE)

dep_declare_fetchcontent(
    absl
    "https://github.com/abseil/abseil-cpp.git"
    "273292d1cfc0a94a65082ee350509af1d113344d"
    "${dep_source_dir}"
    "${dep_binary_dir}"
)
FetchContent_MakeAvailable(absl)
