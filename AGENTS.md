# CMake Migration Direction

## Goal

Add a Visual Studio 2022 based CMake build for `quarkGL` without disrupting the
current Bazel setup.

## First Target

- Platform: Windows only
- Generator: Visual Studio 17 2022
- Configuration: Debug first
- Outputs: `quarkgl` library, `examples/*`, `model_render`

## Dependency Policy

Keep the existing dependency split explicit and stable.

- Use `third_party/` for vendored or prebuilt dependencies already stored in the repo.
- Use `deps/` plus `FetchContent` only for dependencies that are currently external.

Planned mapping:

- `glfw`: FetchContent
- `absl`: FetchContent
- `gtest`: FetchContent only if tests are wired later
- `glad`: local `third_party/glad`
- `glm`: local `third_party/glm`
- `stb_image`: local `third_party/stb_image`
- `imgui`: local `third_party/imgui`
- `imguizmo_quat`: local `third_party/imguizmo_quat`
- `assimp`: local prebuilt import from `third_party/assimp`

## Structure

Planned files:

- `CMakeLists.txt`
- `CMakePresets.json`
- `cmake/Dependencies.cmake`
- `cmake/Dep_*.cmake`
- `quarkgl/CMakeLists.txt`
- `examples/CMakeLists.txt`
- `model_render/CMakeLists.txt`

## Build Rules

- Do not replace Bazel files.
- Keep C and C++ standards aligned with the current repo expectations.
- Prefer static libraries unless a dependency forces otherwise.
- Make the repository root the debugger working directory so shader and asset
  relative paths continue to work.
- Preserve current include behavior for `qrk/...` headers.

## Known Constraints

- `assimp` is currently tied to the prebuilt VS 2022 (`vc143`) debug library in
  `third_party/assimp`.
- Release support is not the first milestone unless matching prebuilt libraries
  are added or assimp is moved to a source build.
- Linux CMake support is a follow-up task, not part of the first pass.

## Non-Goals For First Pass

- Rebuilding every third-party dependency from source
- Removing Bazel
- Making Windows and Linux CMake parity in one step
- Refactoring runtime asset or shader loading paths

## Definition Of Done For Phase 1

- `cmake --preset vs2022-debug` configures successfully
- `cmake --build --preset build-vs2022-debug` builds successfully
- Generated Visual Studio solution can run targets from the repo root
- `model_render` and at least one sample from `examples/` link successfully

## Implementation Order

1. Add dependency helper modules and root CMake entrypoints.
2. Define local imported and interface targets for `third_party/`.
3. Build the `quarkgl` library.
4. Add `examples` and `model_render`.
5. Add presets and verify configure/build.
