#!/usr/bin/env python3
"""
Create a luxury 3D Emblem / Badge in Blender from the 2D image.
Includes:
- 3D Medallion base with beveled rims and physical depth
- 100% All-Quad Grid-Filled Circular Disc for flawless 3D displacement
- 3D Relief surface with high-resolution displacement and micro-bevels
- PBR Shaders: Polished Metallic Gold + Deep Glossy Enamel
- Studio 3-point lighting setup (Key, Fill, Rim lights)
- Centered cinematic camera angled to showcase 3D depth and thickness
- Cycles/EEVEE render output and .blend file save
"""

import math
import os
import sys
from pathlib import Path

import bpy
import mathutils


def build_3d_emblem(image_path: str, output_blend: str, output_render: str):
    print("Starting 3D Emblem creation in Blender...")

    # 1. Clear existing scene objects and materials
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)

    for mat in list(bpy.data.materials):
        bpy.data.materials.remove(mat, do_unlink=True)
    for mesh in list(bpy.data.meshes):
        bpy.data.meshes.remove(mesh, do_unlink=True)
    for tex in list(bpy.data.textures):
        bpy.data.textures.remove(tex, do_unlink=True)
    for img in list(bpy.data.images):
        bpy.data.images.remove(img, do_unlink=True)

    # 2. Load the image texture
    print(f"Loading image texture from: {image_path}")
    image = bpy.data.images.load(image_path, check_existing=True)

    radius = 1.45
    depth = 0.22

    # 3. Create the 3D Medallion Base
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=128,
        radius=radius,
        depth=depth,
        location=(0, 0, 0)
    )
    base_obj = bpy.context.active_object
    base_obj.name = "Medallion_Base"
    bpy.ops.object.shade_smooth()

    # Bevel modifier on the base
    bev = base_obj.modifiers.new(name="Bevel", type='BEVEL')
    bev.width = 0.03
    bev.segments = 5
    bev.limit_method = 'ANGLE'
    bev.angle_limit = math.radians(40)

    # Base Material: Brushed Dark Obsidian / Gunmetal
    base_mat = bpy.data.materials.new(name="Base_Gunmetal")
    base_mat.use_nodes = True
    bn = base_mat.node_tree.nodes
    bl = base_mat.node_tree.links
    bn.clear()
    b_out = bn.new(type="ShaderNodeOutputMaterial")
    b_bsdf = bn.new(type="ShaderNodeBsdfPrincipled")
    b_bsdf.inputs["Base Color"].default_value = (0.015, 0.015, 0.018, 1.0)
    b_bsdf.inputs["Metallic"].default_value = 0.88
    b_bsdf.inputs["Roughness"].default_value = 0.25
    bl.new(b_bsdf.outputs["BSDF"], b_out.inputs["Surface"])
    base_obj.data.materials.append(base_mat)

    # 4. Create the Outer Gold Rim Ring
    bpy.ops.mesh.primitive_torus_add(
        major_radius=radius - 0.02,
        minor_radius=0.032,
        major_segments=96,
        minor_segments=32,
        location=(0, 0, depth / 2 + 0.005)
    )
    rim_obj = bpy.context.active_object
    rim_obj.name = "Gold_Rim"
    bpy.ops.object.shade_smooth()

    gold_rim_mat = bpy.data.materials.new(name="Gold_Rim_Material")
    gold_rim_mat.use_nodes = True
    gn = gold_rim_mat.node_tree.nodes
    gl = gold_rim_mat.node_tree.links
    gn.clear()
    g_out = gn.new(type="ShaderNodeOutputMaterial")
    g_bsdf = gn.new(type="ShaderNodeBsdfPrincipled")
    g_bsdf.inputs["Base Color"].default_value = (1.0, 0.77, 0.34, 1.0)
    g_bsdf.inputs["Metallic"].default_value = 1.0
    g_bsdf.inputs["Roughness"].default_value = 0.12
    gl.new(g_bsdf.outputs["BSDF"], g_out.inputs["Surface"])
    rim_obj.data.materials.append(gold_rim_mat)

    # 5. Create the 3D Emblem Relief Surface using a 100% all-quad grid
    # A circular disc filled with clean quads (Grid Fill)
    disc_radius = radius - 0.04
    bpy.ops.mesh.primitive_circle_add(
        vertices=64,
        radius=disc_radius,
        fill_type='NOTHING',
        location=(0, 0, depth / 2 + 0.01)
    )
    face_obj = bpy.context.active_object
    face_obj.name = "Emblem_Relief"

    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.fill_grid(span=16)
    bpy.ops.object.mode_set(mode='OBJECT')
    bpy.ops.object.shade_smooth()

    # Assign mathematical UV coordinates (exact center, no distortion)
    mesh = face_obj.data
    uv_layer = mesh.uv_layers.new(name="UVMap")
    mesh.uv_layers.active = uv_layer
    for loop in mesh.loops:
        vx, vy, _ = mesh.vertices[loop.vertex_index].co
        u = (vx / (2 * disc_radius)) + 0.5
        v = (vy / (2 * disc_radius)) + 0.5
        loop_uv = uv_layer.data[loop.index]
        loop_uv.uv = (u, v)

    # Add Subdivision Surface Modifier
    subsurf = face_obj.modifiers.new(name="Subdivision", type='SUBSURF')
    subsurf.subdivision_type = 'SIMPLE'
    subsurf.levels = 3
    subsurf.render_levels = 4

    # Create Texture for Displacement
    disp_tex = bpy.data.textures.new(name="Emblem_Disp_Tex", type='IMAGE')
    disp_tex.image = image

    # Add Displace Modifier
    disp_mod = face_obj.modifiers.new(name="Displace", type='DISPLACE')
    disp_mod.texture = disp_tex
    disp_mod.texture_coords = 'UV'
    disp_mod.mid_level = 0.0
    disp_mod.strength = 0.065

    # 6. Advanced Emblem Material Setup
    emblem_mat = bpy.data.materials.new(name="Emblem_Luxury_Shader")
    emblem_mat.use_nodes = True
    mn = emblem_mat.node_tree.nodes
    ml = emblem_mat.node_tree.links
    mn.clear()

    m_out = mn.new(type="ShaderNodeOutputMaterial")
    m_out.location = (600, 0)

    m_bsdf = mn.new(type="ShaderNodeBsdfPrincipled")
    m_bsdf.location = (200, 0)

    tex_node = mn.new(type="ShaderNodeTexImage")
    tex_node.image = image
    tex_node.interpolation = 'Smart'
    tex_node.location = (-600, 0)

    # ColorRamp for Metallic: Golden parts = 1.0, dark parts = 0.1
    cramp_metal = mn.new(type="ShaderNodeValToRGB")
    cramp_metal.location = (-200, 150)
    cramp_metal.color_ramp.elements[0].position = 0.18
    cramp_metal.color_ramp.elements[0].color = (0.12, 0.12, 0.12, 1.0)
    cramp_metal.color_ramp.elements[1].position = 0.45
    cramp_metal.color_ramp.elements[1].color = (1.0, 1.0, 1.0, 1.0)

    # ColorRamp for Roughness: Polished Gold = 0.15, dark enamel = 0.38
    cramp_rough = mn.new(type="ShaderNodeValToRGB")
    cramp_rough.location = (-200, -100)
    cramp_rough.color_ramp.elements[0].position = 0.2
    cramp_rough.color_ramp.elements[0].color = (0.38, 0.38, 0.38, 1.0)
    cramp_rough.color_ramp.elements[1].position = 0.55
    cramp_rough.color_ramp.elements[1].color = (0.15, 0.15, 0.15, 1.0)

    # Bump Node for crisp normal detail and bevel highlights
    bump_node = mn.new(type="ShaderNodeBump")
    bump_node.location = (-50, -350)
    bump_node.inputs["Strength"].default_value = 0.75
    bump_node.inputs["Distance"].default_value = 0.04

    # Connect nodes
    ml.new(tex_node.outputs["Color"], m_bsdf.inputs["Base Color"])
    ml.new(tex_node.outputs["Color"], cramp_metal.inputs["Fac"])
    ml.new(cramp_metal.outputs["Color"], m_bsdf.inputs["Metallic"])
    ml.new(tex_node.outputs["Color"], cramp_rough.inputs["Fac"])
    ml.new(cramp_rough.outputs["Color"], m_bsdf.inputs["Roughness"])
    ml.new(tex_node.outputs["Color"], bump_node.inputs["Height"])
    ml.new(bump_node.outputs["Normal"], m_bsdf.inputs["Normal"])
    ml.new(m_bsdf.outputs["BSDF"], m_out.inputs["Surface"])

    face_obj.data.materials.append(emblem_mat)

    # Group all parts to an empty for clean transformation
    bpy.ops.object.empty_add(type='PLAIN_AXES', location=(0, 0, 0))
    emblem_root = bpy.context.active_object
    emblem_root.name = "Emblem_Root"

    base_obj.parent = emblem_root
    rim_obj.parent = emblem_root
    face_obj.parent = emblem_root

    # Subtle tilt to display 3D depth while keeping everything beautifully centered
    emblem_root.rotation_euler = (math.radians(20), math.radians(-8), math.radians(6))

    # 7. Studio Three-Point Lighting Setup
    print("Setting up studio lighting...")

    # Key Light (Warm, high energy, angled at 45 degrees)
    bpy.ops.object.light_add(type='AREA', radius=1.5, location=(2.2, -2.5, 2.8))
    key_light = bpy.context.active_object
    key_light.name = "Key_Light_Warm"
    key_light.data.energy = 320
    key_light.data.color = (1.0, 0.95, 0.88)

    ck = key_light.constraints.new(type='TRACK_TO')
    ck.target = emblem_root
    ck.track_axis = 'TRACK_NEGATIVE_Z'
    ck.up_axis = 'UP_Y'

    # Fill Light (Cool, soft, low energy, opposite side)
    bpy.ops.object.light_add(type='AREA', radius=2.2, location=(-2.6, -2.0, 1.8))
    fill_light = bpy.context.active_object
    fill_light.name = "Fill_Light_Cool"
    fill_light.data.energy = 110
    fill_light.data.color = (0.86, 0.93, 1.0)

    cf = fill_light.constraints.new(type='TRACK_TO')
    cf.target = emblem_root
    cf.track_axis = 'TRACK_NEGATIVE_Z'
    cf.up_axis = 'UP_Y'

    # Rim / Backlight (Golden highlights on top and sides)
    bpy.ops.object.light_add(type='POINT', location=(0.0, 2.2, 2.6))
    rim_light = bpy.context.active_object
    rim_light.name = "Rim_Light_Gold"
    rim_light.data.energy = 190
    rim_light.data.color = (1.0, 0.84, 0.52)

    # Front Specular Highlight Light
    bpy.ops.object.light_add(type='SPOT', location=(0.3, -1.2, 2.8))
    spot_light = bpy.context.active_object
    spot_light.name = "Spot_Highlight"
    spot_light.data.energy = 150
    spot_light.data.spot_size = math.radians(50)
    spot_light.data.spot_blend = 0.5
    spot_light.data.color = (1.0, 0.98, 0.92)

    cs = spot_light.constraints.new(type='TRACK_TO')
    cs.target = emblem_root
    cs.track_axis = 'TRACK_NEGATIVE_Z'
    cs.up_axis = 'UP_Y'

    # 8. Perfectly Centered Camera Setup
    print("Setting up centered product camera...")
    # Camera placed directly in front-below-right, looking straight at the emblem center
    bpy.ops.object.camera_add(location=(0.0, -3.8, 1.3))
    camera = bpy.context.active_object
    camera.name = "Hero_Camera"
    camera.data.lens = 70  # 70mm lens gives flattering product perspective without distortion
    bpy.context.scene.camera = camera

    cc = camera.constraints.new(type='TRACK_TO')
    cc.target = emblem_root
    cc.track_axis = 'TRACK_NEGATIVE_Z'
    cc.up_axis = 'UP_Y'

    # 9. Render & World Settings
    scene = bpy.context.scene
    scene.render.resolution_x = 1920
    scene.render.resolution_y = 1080
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = 'PNG'
    scene.render.image_settings.color_mode = 'RGBA'

    # Studio World Background
    world = scene.world
    if not world:
        world = bpy.data.worlds.new("Studio_World")
        scene.world = world
    world.use_nodes = True
    bg_node = world.node_tree.nodes.get("Background")
    if bg_node:
        bg_node.inputs["Color"].default_value = (0.018, 0.02, 0.025, 1.0)
        bg_node.inputs["Strength"].default_value = 0.35

    # 10. Save the .blend file
    print(f"Saving Blender file to: {output_blend}")
    bpy.ops.wm.save_as_mainfile(filepath=output_blend)

    # 11. Render the preview image
    print(f"Rendering high-res preview to: {output_render}")
    scene.render.filepath = output_render
    bpy.ops.render.render(write_still=True)

    print("3D Emblem creation and render completed successfully!")


def main():
    try:
        script_dir = Path(__file__).resolve().parent
    except NameError:
        script_dir = Path("/Users/mahdimalvandi/Desktop/codes/code/test")

    image_path = str(script_dir / "5ce4dade-40f7-4c70-a5e9-83ebe41b64f5-Photoroom.png")
    output_blend = str(script_dir / "emblem_3d.blend")
    output_render = str(script_dir / "emblem_3d_render.png")

    build_3d_emblem(image_path, output_blend, output_render)


if __name__ == "__main__":
    main()
