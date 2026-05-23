# Shader Notes

## Scope

This document captures shader-side conventions and the current model/material
mapping used by `quarkGL`.

## Naming Conventions

- Vertex attributes use the `a_` prefix.
  - Examples: `a_position`, `a_normal`, `a_tangent`, `a_uv`
- Uniforms use the `u_` prefix.
  - Examples: `u_model`, `u_view`, `u_projection`, `u_material`
- Shared engine shader functions keep the `qrk_` prefix.
  - Use strict snake_case after the prefix.
  - Example: `qrk_gamma_correct`, `qrk_shade_all_lights_cook_torrance_ggx`
- Engine-reserved global shader symbols also keep the `qrk_` prefix.
  - Examples: `qrk_directionalLights`, `qrk_windowWidth`, `qrk_deltaTime`

## glTF Material Granularity

glTF materials are effectively assigned per mesh primitive, not per scene node.

- A glTF `node` references a `mesh`
- A `mesh` contains one or more primitives
- Each primitive can reference its own `material`

In this codebase that maps naturally to Assimp `aiMesh` processing:

- `Model::processNode()` walks Assimp nodes and submits each `aiMesh`
- `Model::processMesh()` builds one `ModelMesh` per `aiMesh`
- The material used for that mesh comes from `mesh->mMaterialIndex`

That means shader/material binding is currently done per rendered mesh chunk,
not as a single material for the whole imported model.

## Current Loader Behavior

The current model loader is defined in [quarkgl/model.cc](/e:/M-Github-Graphics/quarkGL/quarkgl/model.cc:8)
and [quarkgl/texture_map.h](/e:/M-Github-Graphics/quarkGL/quarkgl/texture_map.h:18).

Current assumptions:

- Assimp triangulates the mesh with `aiProcess_Triangulate`
- Missing normals are generated with `aiProcess_GenSmoothNormals`
- Tangent space is generated with `aiProcess_CalcTangentSpace`
- Only UV set `0` is consumed
- Missing normals, tangents, or UVs fall back to zero values

## Shader Material Interface

Runtime texture binding is handled in [quarkgl/mesh.cc](/e:/M-Github-Graphics/quarkGL/quarkgl/mesh.cc:96)
and maps imported textures into `u_material.*`.

### Texture Slots

- Diffuse/albedo textures:
  - `u_material.diffuseMaps[i]`
- Specular textures:
  - `u_material.specularMaps[i]`
- Roughness textures:
  - `u_material.roughnessMaps[i]`
- Metallic textures:
  - `u_material.metallicMaps[i]`
- Ambient occlusion textures:
  - `u_material.aoMaps[i]`
- Emission textures:
  - `u_material.emissionMaps[i]`
- Normal texture:
  - `u_material.u_normalMap`

### Count / Flags

- `u_material.diffuseCount`
- `u_material.specularCount`
- `u_material.roughnessCount`
- `u_material.metallicCount`
- `u_material.aoCount`
- `u_material.emissionCount`
- `u_material.hasNormalMap`
- `u_material.roughnessIsPacked[i]`
- `u_material.metallicIsPacked[i]`
- `u_material.aoIsPacked[i]`

## Assimp To Shader Map Types

The current mapping is:

- `aiTextureType_DIFFUSE` -> `TextureMapType::DIFFUSE` -> `u_material.diffuseMaps[]`
- `aiTextureType_SPECULAR` -> `TextureMapType::SPECULAR` -> `u_material.specularMaps[]`
- `aiTextureType_DIFFUSE_ROUGHNESS` -> `TextureMapType::ROUGHNESS` -> `u_material.roughnessMaps[]`
- `aiTextureType_METALNESS` -> `TextureMapType::METALLIC` -> `u_material.metallicMaps[]`
- `aiTextureType_LIGHTMAP` -> `TextureMapType::AO` -> `u_material.aoMaps[]`
- `aiTextureType_EMISSIVE` -> `TextureMapType::EMISSION` -> `u_material.emissionMaps[]`
- `aiTextureType_NORMALS` -> `TextureMapType::NORMAL` -> `u_material.u_normalMap`

There is one deliberate overlap:

- `TextureMapType::SPECULAR` also accepts `aiTextureType_METALNESS`
- This exists so a metalness texture can also feed specular-style shading
- When the same texture is reused for multiple semantic slots, it is marked as
  packed

## Packed Texture Behavior

When the same underlying texture file is loaded into multiple map roles, the
loader marks it as packed and shaders are expected to read the conventional
channel.

Current channel assumptions in [quarkgl/shaders/lighting.frag](/e:/M-Github-Graphics/quarkGL/quarkgl/shaders/lighting.frag:104):

- AO uses the red channel
- Roughness uses the green channel when packed
- Metallic uses the blue channel when packed
- Specular extraction also reads the blue channel when using a metallic map as
  a fallback

## Shader Authoring Implications

- Do not assume one material per imported model
- Assume one material per rendered mesh/primitive chunk
- If a glTF asset contains multiple primitives, the renderer may bind different
  textures between draw calls for the same logical model
- Deferred shaders should continue extracting material values from `u_material`
  rather than assuming baked uniform constants
- If additional glTF material features are added later, they should extend the
  `QrkMaterial` interface instead of bypassing it ad hoc

## Current Gaps

- Only the first UV set is used
- Normal map support is single-texture only
- Material scalar factors from glTF are not documented here as first-class
  loader inputs yet
- This document describes the current implementation, not the full glTF 2.0
  material feature set
