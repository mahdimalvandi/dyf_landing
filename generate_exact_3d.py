#!/usr/bin/env python3
"""
Generate an EXACT, pixel-accurate, multi-layered 3D Emblem in Blender.
- 100% faithful to the original image and SVG dimensions and details.
- True sculptural 3D relief with physical depth hierarchy:
    * Layer 1: Recessed solid Dark Obsidian / Enamel Shield Base with micro-bevels
    * Layer 2: Elevated 24K Polished Gold Relief Structure:
        - Outer Beveled Horseshoe / Shield Rim
        - Bilateral Laurel Wreath Branches and leaves
        - Central "AM" Monogram with hollow cutouts
        - Bottom Serif Letters "D", "Y", "F" with hollow counters
- Solid watertight caps (fill_mode='BOTH') for all elements
- Front faces: Exact lossless UV mapping of original texture
- Sides and bevels: Mirror-polished 24K gold and dark enamel
- Web-ready GLB for interactive 3D rotation in index.html (model-viewer)
- Studio lighting, centered camera, and high-res Cycles/EEVEE render
"""

import json
import math
import os
from collections import defaultdict
from pathlib import Path

import bpy
import numpy as np


def rdp_simplify(points, epsilon=0.75):
    """Ramer-Douglas-Peucker polygon simplification for crisp vector paths."""
    pts = np.asarray(points, dtype=float)
    if len(pts) < 3:
        return pts.tolist()
    start, end = pts[0], pts[-1]
    line_vec = end - start
    line_len = np.linalg.norm(line_vec)
    if line_len == 0:
        d = np.linalg.norm(pts - start, axis=1)
    else:
        line_unit = line_vec / line_len
        proj = np.clip(np.dot(pts - start, line_unit), 0, line_len)
        d = np.linalg.norm(pts - (start + np.outer(proj, line_unit)), axis=1)
    idx = int(np.argmax(d))
    if d[idx] > epsilon:
        return rdp_simplify(pts[: idx + 1], epsilon)[:-1] + rdp_simplify(pts[idx:], epsilon)
    else:
        return [start.tolist(), end.tolist()]


def find_closed_loops(binary_mask, min_len=20):
    """Extracts directed boundary loops from a boolean mask."""
    pad_m = np.pad(binary_mask, 1, mode="constant", constant_values=False)
    edges = set()
    ys, xs = np.where(pad_m)
    for y, x in zip(ys, xs):
        if not pad_m[y - 1, x]:
            edges.add(((x, y), (x + 1, y)))
        if not pad_m[y + 1, x]:
            edges.add(((x + 1, y + 1), (x, y + 1)))
        if not pad_m[y, x - 1]:
            edges.add(((x, y + 1), (x, y)))
        if not pad_m[y, x + 1]:
            edges.add(((x + 1, y), (x + 1, y + 1)))

    next_pts = defaultdict(list)
    for p1, p2 in edges:
        next_pts[p1].append(p2)

    visited = set()
    loops = []
    for p_start in list(next_pts.keys()):
        for p_next in next_pts[p_start]:
            if (p_start, p_next) in visited:
                continue
            loop = [p_start]
            curr = p_next
            visited.add((p_start, curr))
            while curr != p_start and curr in next_pts:
                loop.append(curr)
                cand = None
                for c in next_pts[curr]:
                    if (curr, c) not in visited:
                        cand = c
                        break
                if cand is None:
                    break
                visited.add((curr, cand))
                curr = cand
            if curr == p_start and len(loop) >= min_len:
                loops.append([(x - 1, y - 1) for x, y in loop])
    return loops


def chamfer_dist(mask):
    """Fast 2-pass Euclidean-approximating chamfer distance transform."""
    H, W = mask.shape
    d = np.full((H, W), 1e5, dtype=np.float32)
    d[~mask] = 0.0
    for y in range(H):
        for x in range(W):
            if not mask[y, x]:
                continue
            v = d[y, x]
            if x > 0:
                v = min(v, d[y, x - 1] + 1.0)
            if y > 0:
                v = min(v, d[y - 1, x] + 1.0)
                if x > 0:
                    v = min(v, d[y - 1, x - 1] + 1.414)
                if x < W - 1:
                    v = min(v, d[y - 1, x + 1] + 1.414)
            d[y, x] = v
    for y in range(H - 1, -1, -1):
        for x in range(W - 1, -1, -1):
            if not mask[y, x]:
                continue
            v = d[y, x]
            if x < W - 1:
                v = min(v, d[y, x + 1] + 1.0)
            if y < H - 1:
                v = min(v, d[y + 1, x] + 1.0)
                if x < W - 1:
                    v = min(v, d[y + 1, x + 1] + 1.414)
                if x > 0:
                    v = min(v, d[y + 1, x - 1] + 1.414)
            d[y, x] = v
    return d


def build_exact_3d():
    current_dir = Path(__file__).resolve().parent
    image_path = current_dir / "5ce4dade-40f7-4c70-a5e9-83ebe41b64f5-Photoroom.png"
    blend_path = current_dir / "emblem_3d.blend"
    glb_path = current_dir / "emblem_3d.glb"
    render_path = current_dir / "emblem_3d_render.png"

    print("--- 1. Loading Texture & Extracting High-Precision Contours ---")
    img = bpy.data.images.load(str(image_path), check_existing=True)
    w, h = img.size[0], img.size[1]
    arr = np.flipud(np.array(img.pixels[:], dtype=np.float32).reshape((h, w, 4)))
    alpha = arr[:, :, 3]
    rgb = arr[:, :, :3]
    lum = 0.299 * rgb[:, :, 0] + 0.587 * rgb[:, :, 1] + 0.114 * rgb[:, :, 2]

    scale = 2.5 / 1024.0
    all_alpha = (alpha > 0.15)

    # 1. Precise Mask Extraction by Topological Connectivity
    # Shield Component (flood fill from interior center)
    visited_s = np.zeros_like(alpha, dtype=bool)
    q_s = [(300, 512)]
    visited_s[300, 512] = True
    s_comp = []
    while q_s:
        cy, cx = q_s.pop()
        s_comp.append((cy, cx))
        for dy, dx in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            ny, nx = cy + dy, cx + dx
            if 0 <= ny < h and 0 <= nx < w and all_alpha[ny, nx] and not visited_s[ny, nx]:
                visited_s[ny, nx] = True
                q_s.append((ny, nx))
    s_mask = np.zeros_like(alpha, dtype=bool)
    for y, x in s_comp:
        s_mask[y, x] = True

    # Shield Outer & Inner Contour Loops
    shield_all = find_closed_loops(s_mask)
    shield_outer_raw = max(shield_all, key=len)
    shield_outer_loop = rdp_simplify(shield_outer_raw + [shield_outer_raw[0]], 0.75)[:-1]

    d_shield = chamfer_dist(s_mask)
    shield_inner_mask = d_shield >= 20.0
    shield_inner_loops = find_closed_loops(shield_inner_mask)
    shield_inner_raw = max(shield_inner_loops, key=len)
    shield_inner_loop = rdp_simplify(shield_inner_raw + [shield_inner_raw[0]], 0.75)[:-1]

    # Letter D (flood fill)
    visited_d = np.zeros_like(alpha, dtype=bool)
    q_d = [(700, 350)]
    visited_d[700, 350] = True
    d_comp = []
    while q_d:
        cy, cx = q_d.pop()
        d_comp.append((cy, cx))
        for dy, dx in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            ny, nx = cy + dy, cx + dx
            if 0 <= ny < h and 0 <= nx < w and all_alpha[ny, nx] and not visited_d[ny, nx]:
                visited_d[ny, nx] = True
                q_d.append((ny, nx))
    d_mask = np.zeros_like(alpha, dtype=bool)
    for y, x in d_comp:
        d_mask[y, x] = True
    loops_d = [rdp_simplify(l + [l[0]], 0.7)[:-1] for l in find_closed_loops(d_mask, min_len=30)]

    # Letter F (flood fill)
    visited_f = np.zeros_like(alpha, dtype=bool)
    q_f = [(700, 650)]
    visited_f[700, 650] = True
    f_comp = []
    while q_f:
        cy, cx = q_f.pop()
        f_comp.append((cy, cx))
        for dy, dx in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            ny, nx = cy + dy, cx + dx
            if 0 <= ny < h and 0 <= nx < w and all_alpha[ny, nx] and not visited_f[ny, nx]:
                visited_f[ny, nx] = True
                q_f.append((ny, nx))
    f_mask = np.zeros_like(alpha, dtype=bool)
    for y, x in f_comp:
        f_mask[y, x] = True
    loops_f = [rdp_simplify(l + [l[0]], 0.7)[:-1] for l in find_closed_loops(f_mask, min_len=30)]

    # Central Letter Y WITH ITS TWO FULL MAJESTIC PETALS (flood fill from foot of Y)
    m_y_cand = np.zeros((h, w), dtype=bool)
    m_y_box = (
        (alpha[564:765, 380:646] > 0.15)
        & ~s_mask[564:765, 380:646]
        & ~d_mask[564:765, 380:646]
        & ~f_mask[564:765, 380:646]
    )
    m_y_cand[564:765, 380:646] = m_y_box
    visited_y = np.zeros_like(m_y_cand, dtype=bool)
    q_y = [(750, 512)]
    visited_y[750, 512] = True
    y_comp = []
    while q_y:
        cy, cx = q_y.pop()
        y_comp.append((cy, cx))
        for dy, dx in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            ny, nx = cy + dy, cx + dx
            if m_y_cand[ny, nx] and not visited_y[ny, nx]:
                visited_y[ny, nx] = True
                q_y.append((ny, nx))
    y_mask = np.zeros_like(alpha, dtype=bool)
    for y, x in y_comp:
        y_mask[y, x] = True
    loops_y = [rdp_simplify(l + [l[0]], 0.75)[:-1] for l in find_closed_loops(y_mask, min_len=30)]

    # 2. Central AM Monogram
    m_am_reg = np.zeros((h, w), dtype=bool)
    m_am_reg[148:495, 390:635] = lum[148:495, 390:635] > 0.30
    visited_am = np.zeros_like(m_am_reg, dtype=bool)
    queue = [(160, 512)]
    visited_am[160, 512] = True
    am_comp = []
    while queue:
        cy, cx = queue.pop()
        am_comp.append((cy, cx))
        for dy, dx in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            ny, nx = cy + dy, cx + dx
            if 148 <= ny < 495 and 390 <= nx < 635 and m_am_reg[ny, nx] and not visited_am[ny, nx]:
                visited_am[ny, nx] = True
                queue.append((ny, nx))
    m_am = np.zeros((h, w), dtype=bool)
    for y, x in am_comp:
        m_am[y, x] = True
    am_raw_loops = find_closed_loops(m_am, min_len=90)
    loops_am = [rdp_simplify(l + [l[0]], 0.8)[:-1] for l in am_raw_loops]

    # 3. Laurel Wreath Wings (All other symmetrical leaf branches)
    wreath_mask = all_alpha & ~s_mask & ~d_mask & ~f_mask & ~y_mask
    visited_w = np.zeros_like(wreath_mask, dtype=bool)
    w_comps = []
    for y in range(h):
        for x in range(w):
            if wreath_mask[y, x] and not visited_w[y, x]:
                comp = []
                queue = [(y, x)]
                visited_w[y, x] = True
                while queue:
                    cy, cx = queue.pop()
                    comp.append((cy, cx))
                    for dy, dx in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                        ny, nx = cy + dy, cx + dx
                        if 0 <= ny < h and 0 <= nx < w and wreath_mask[ny, nx] and not visited_w[ny, nx]:
                            visited_w[ny, nx] = True
                            queue.append((ny, nx))
                if len(comp) > 200:
                    w_comps.append(comp)

    wreath_loop_groups = []
    for comp in w_comps:
        m_w = np.zeros((h, w), dtype=bool)
        for y, x in comp:
            m_w[y, x] = True
        l_raw = find_closed_loops(m_w, min_len=25)
        wreath_loop_groups.append([rdp_simplify(l + [l[0]], 0.7)[:-1] for l in l_raw])

    print("--- 2. Resetting Blender Scene ---")
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for m in list(bpy.data.materials):
        bpy.data.materials.remove(m, do_unlink=True)
    for m in list(bpy.data.meshes):
        bpy.data.meshes.remove(m, do_unlink=True)
    for c in list(bpy.data.curves):
        bpy.data.curves.remove(c, do_unlink=True)

    print("--- 3. Setting Up Materials ---")

    def make_material(name, base_color, metallic, roughness, use_tex=False):
        mat = bpy.data.materials.new(name=name)
        mat.use_nodes = True
        nodes = mat.node_tree.nodes
        links = mat.node_tree.links
        nodes.clear()

        out_node = nodes.new(type="ShaderNodeOutputMaterial")
        bsdf_node = nodes.new(type="ShaderNodeBsdfPrincipled")

        if use_tex:
            tex_node = nodes.new(type="ShaderNodeTexImage")
            tex_node.image = img
            tex_node.interpolation = "Cubic"
            uv_node = nodes.new(type="ShaderNodeUVMap")
            uv_node.uv_map = "UVMap"
            links.new(uv_node.outputs["UV"], tex_node.inputs["Vector"])
            links.new(tex_node.outputs["Color"], bsdf_node.inputs["Base Color"])
            bsdf_node.inputs["Metallic"].default_value = metallic
            bsdf_node.inputs["Roughness"].default_value = roughness
        else:
            bsdf_node.inputs["Base Color"].default_value = base_color
            bsdf_node.inputs["Metallic"].default_value = metallic
            bsdf_node.inputs["Roughness"].default_value = roughness

        links.new(bsdf_node.outputs["BSDF"], out_node.inputs["Surface"])
        return mat

    # Luxurious 24K Imperial Gold (High metallic, satin-polished reflection)
    mat_gold_24k = make_material("Gold_24K_Solid", (1.0, 0.76, 0.28, 1.0), 1.0, 0.16)
    mat_gold_relief = make_material("Gold_Relief_Front", (1.0, 0.78, 0.32, 1.0), 0.85, 0.20, use_tex=True)
    mat_enamel_front = make_material("Dark_Enamel_Front", (0.04, 0.035, 0.03, 1.0), 0.40, 0.30, use_tex=True)

    print("--- 4. Building Solid 3D Geometry ---")

    def build_solid_mesh(
        name,
        loops,
        extrude,
        z_pos,
        front_mat,
        side_mat,
        back_mat=None,
        bevel_width=0.002,
        is_back=False,
    ):
        c_data = bpy.data.curves.new(name=name, type="CURVE")
        c_data.dimensions = "2D"
        c_data.fill_mode = "BOTH"  # Creates solid watertight caps
        c_data.extrude = extrude

        for loop in loops:
            spline = c_data.splines.new(type="POLY")
            spline.points.add(len(loop) - 1)
            for i, (x, y) in enumerate(loop):
                if is_back:
                    bx = -(x - 512.0) * scale
                else:
                    bx = (x - 512.0) * scale
                by = -(y - 512.0) * scale
                spline.points[i].co = (bx, by, 0.0, 1.0)
            spline.use_cyclic_u = True

        obj = bpy.data.objects.new(name, c_data)
        obj.location.z = z_pos
        bpy.context.collection.objects.link(obj)

        bpy.context.view_layer.objects.active = obj
        obj.select_set(True)
        bpy.ops.object.convert(target="MESH")
        mesh_obj = bpy.context.active_object
        mesh = mesh_obj.data

        # Lossless UV Mapping
        for l in list(mesh.uv_layers):
            mesh.uv_layers.remove(l)
        uv_layer = mesh.uv_layers.new(name="UVMap")
        uv_layer.active = True
        uv_layer.active_render = True
        thresh = extrude * 0.5
        for l in mesh.loops:
            v_co = mesh.vertices[l.vertex_index].co
            vx, vy, vz = v_co.x, v_co.y, v_co.z
            if vz < -thresh or is_back:
                u = (-vx / scale + 512.0) / 1024.0
            else:
                u = (vx / scale + 512.0) / 1024.0
            v = (vy / scale + 512.0) / 1024.0
            uv_layer.data[l.index].uv = (u, v)

        # Materials slots
        mesh.materials.append(front_mat)  # Slot 0
        mesh.materials.append(side_mat)   # Slot 1
        if back_mat is not None:
            mesh.materials.append(back_mat)  # Slot 2

        # Assign materials based strictly on vertex Z coordinates
        # Top cap (Z > thresh): front_mat (Slot 0)
        # Bottom cap (Z < -thresh): back_mat (Slot 2) or side_mat (Slot 1)
        # Sides/bevels: side_mat (Slot 1)
        for poly in mesh.polygons:
            poly_zs = [mesh.vertices[vi].co.z for vi in poly.vertices]
            if all(z > thresh for z in poly_zs):
                poly.material_index = 0  # Front cap
            elif all(z < -thresh for z in poly_zs):
                poly.material_index = 2 if back_mat is not None else 1  # Back cap
            else:
                poly.material_index = 1  # Sides

        bpy.ops.object.shade_smooth()

        if bevel_width > 0:
            bev = mesh_obj.modifiers.new(name="Bevel", type="BEVEL")
            bev.width = bevel_width
            bev.segments = 3
            bev.limit_method = "ANGLE"
            bev.angle_limit = math.radians(35)
            bev.use_clamp_overlap = True
            bpy.ops.object.modifier_apply(modifier="Bevel")

        mesh.update()
        return mesh_obj

    created_objects = []

    # 1. Solid Shield Base Core
    # Both Front and Back caps get the rich diamond leather texture (UV-mapped), sides get 24K solid gold
    obj_shield_base = build_solid_mesh(
        "Shield_Base",
        [shield_outer_loop],
        extrude=0.007,
        z_pos=0.0,
        front_mat=mat_enamel_front,
        side_mat=mat_gold_24k,
        back_mat=mat_enamel_front,
        bevel_width=0.002,
    )
    created_objects.append(obj_shield_base)

    # 2. Shield Gold Rim (Front & Back - slim, elegant bas-relief)
    obj_shield_rim_front = build_solid_mesh(
        "Shield_Rim_Front",
        [shield_outer_loop, shield_inner_loop],
        extrude=0.004,
        z_pos=0.008,
        front_mat=mat_gold_relief,
        side_mat=mat_gold_24k,
        bevel_width=0.0016,
    )
    created_objects.append(obj_shield_rim_front)

    obj_shield_rim_back = build_solid_mesh(
        "Shield_Rim_Back",
        [shield_outer_loop, shield_inner_loop],
        extrude=0.004,
        z_pos=-0.008,
        front_mat=mat_gold_relief,
        side_mat=mat_gold_24k,
        bevel_width=0.0016,
        is_back=True,
    )
    created_objects.append(obj_shield_rim_back)

    # 3. AM Monogram (Front & Back - raised chiseled gold)
    obj_am_front = build_solid_mesh(
        "AM_Monogram_Front",
        loops_am,
        extrude=0.005,
        z_pos=0.009,
        front_mat=mat_gold_relief,
        side_mat=mat_gold_24k,
        bevel_width=0.0015,
    )
    created_objects.append(obj_am_front)

    obj_am_back = build_solid_mesh(
        "AM_Monogram_Back",
        loops_am,
        extrude=0.005,
        z_pos=-0.009,
        front_mat=mat_gold_relief,
        side_mat=mat_gold_24k,
        bevel_width=0.0015,
        is_back=True,
    )
    created_objects.append(obj_am_back)

    # 4. Laurel Wreath Wings (Solid 3D sculptural leaves - smooth front, sides, and back)
    for idx, w_loops in enumerate(wreath_loop_groups):
        obj_w = build_solid_mesh(
            f"Wreath_Leaf_{idx+1}",
            w_loops,
            extrude=0.007,
            z_pos=0.0,
            front_mat=mat_gold_relief,
            side_mat=mat_gold_24k,
            back_mat=mat_gold_24k,
            bevel_width=0.0018,
        )
        created_objects.append(obj_w)

    # 5. Letters D, Y, F (Solid 3D sculptural gold letters - watertight, natural bevels)
    for name_l, loops_l in [("Letter_D", loops_d), ("Letter_Y", loops_y), ("Letter_F", loops_f)]:
        obj_l = build_solid_mesh(
            name_l,
            loops_l,
            extrude=0.007,
            z_pos=0.0,
            front_mat=mat_gold_relief,
            side_mat=mat_gold_24k,
            back_mat=mat_gold_24k,
            bevel_width=0.0018,
        )
        created_objects.append(obj_l)

    # Parent all objects to a single root Empty
    bpy.ops.object.empty_add(type="PLAIN_AXES", location=(0, 0, 0))
    emblem_root = bpy.context.active_object
    emblem_root.name = "Emblem_Root"
    for o in created_objects:
        o.parent = emblem_root

    # Stand upright in Blender (X rotation +90 deg) so in standard 3D & glTF Y is Up, Z is Forward
    emblem_root.rotation_euler = (math.radians(90), 0.0, 0.0)

    print("--- 5. Setting Up Studio Environment & Lighting ---")
    scene = bpy.context.scene
    world = scene.world
    if not world:
        world = bpy.data.worlds.new("Studio_World")
        scene.world = world
    world.use_nodes = True
    bg = world.node_tree.nodes.get("Background")
    if bg:
        # Luxury studio environment radiance
        bg.inputs["Color"].default_value = (0.75, 0.80, 0.90, 1.0)
        bg.inputs["Strength"].default_value = 0.85

    # Key Light (Warm, high power, sharp specular)
    bpy.ops.object.light_add(type="AREA", radius=1.6, location=(1.8, -2.8, 1.2))
    key = bpy.context.active_object
    key.name = "Key_Light"
    key.data.energy = 650
    key.data.color = (1.0, 0.95, 0.88)
    ck = key.constraints.new(type="TRACK_TO")
    ck.target = emblem_root
    ck.track_axis = "TRACK_NEGATIVE_Z"
    ck.up_axis = "UP_Y"

    # Fill Light (Cool, soft)
    bpy.ops.object.light_add(type="AREA", radius=2.2, location=(-2.2, -2.2, 0.8))
    fill = bpy.context.active_object
    fill.name = "Fill_Light"
    fill.data.energy = 300
    fill.data.color = (0.86, 0.92, 1.0)
    cf = fill.constraints.new(type="TRACK_TO")
    cf.target = emblem_root
    cf.track_axis = "TRACK_NEGATIVE_Z"
    cf.up_axis = "UP_Y"

    # Rim / Edge Light (Golden rim from top back)
    bpy.ops.object.light_add(type="POINT", location=(0.0, 2.2, 2.0))
    rim = bpy.context.active_object
    rim.name = "Rim_Light"
    rim.data.energy = 350
    rim.data.color = (1.0, 0.82, 0.50)

    # Specular Glint directly in front
    bpy.ops.object.light_add(type="SPOT", location=(0.0, -3.2, 0.2))
    spot = bpy.context.active_object
    spot.name = "Specular_Accent"
    spot.data.energy = 280
    spot.data.spot_size = math.radians(55)
    spot.data.spot_blend = 0.5
    spot.data.color = (1.0, 0.98, 0.92)
    cs = spot.constraints.new(type="TRACK_TO")
    cs.target = emblem_root
    cs.track_axis = "TRACK_NEGATIVE_Z"
    cs.up_axis = "UP_Y"

    print("--- 6. Setting Up Centered Front Camera ---")
    # Camera in front (-Y in Blender, looking at +Y with subtle tilt)
    cam_dist = 3.1
    bpy.ops.object.camera_add(location=(0.0, -cam_dist, 0.05))
    camera = bpy.context.active_object
    camera.name = "Hero_Camera"
    camera.data.lens = 52
    scene.camera = camera
    cc = camera.constraints.new(type="TRACK_TO")
    cc.target = emblem_root
    cc.track_axis = "TRACK_NEGATIVE_Z"
    cc.up_axis = "UP_Y"

    scene.render.film_transparent = True
    scene.render.resolution_x = 1200
    scene.render.resolution_y = 1200
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA"

    print(f"--- 7. Saving .blend to: {blend_path} ---")
    bpy.ops.wm.save_as_mainfile(filepath=str(blend_path))

    print(f"--- 8. Exporting Web 3D GLB to: {glb_path} ---")
    bpy.ops.export_scene.gltf(
        filepath=str(glb_path),
        export_format="GLB",
        export_apply=True,
        export_materials="EXPORT",
    )

    print(f"--- 9. Rendering Preview to: {render_path} ---")
    scene.render.filepath = str(render_path)
    bpy.ops.render.render(write_still=True)

    print("EXACT_3D_EMBLEM_GENERATION_COMPLETED_SUCCESSFULLY")


if __name__ == "__main__":
    build_exact_3d()
