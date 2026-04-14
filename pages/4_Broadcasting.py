"""
Page 4 – Broadcasting: animated 3-stage expansion visualisation.
"""

import streamlit as st
import numpy as np
from utils.theme import page_setup, get_colors, TEAL, PURPLE, AMBER, CORAL
from utils.viz import array_heatmap, shape_badge, array_input, formula_bar
from utils.animator import Animator

page_setup("Broadcasting", "📡")
c = get_colors()

st.markdown(f'<h2 style="color:{CORAL};">📡 Broadcasting</h2>', unsafe_allow_html=True)
st.caption("Watch NumPy stretch arrays to compatible shapes — stage by stage.")
st.markdown("---")

with st.sidebar:
    st.subheader("Scenario")
    scenario = st.radio("Pick", [
        "2D + 1D row vector", "2D + 1D column vector",
        "1D + scalar", "Column + Row → 2D", "Custom shapes",
    ])
    st.markdown("---")
    seed = st.number_input("Seed", value=5, step=1)
    op_sym = st.selectbox("Operation", ["+", "×", "−"])

rng = np.random.default_rng(int(seed))
op_fn = {"+": np.add, "×": np.multiply, "−": np.subtract}[op_sym]

if scenario == "2D + 1D row vector":
    A_def = rng.integers(1, 10, (3, 4)).astype(float)
    B_def = rng.integers(1, 10, (4,)).astype(float)
elif scenario == "2D + 1D column vector":
    A_def = rng.integers(1, 10, (4, 3)).astype(float)
    B_def = rng.integers(1, 10, (4, 1)).astype(float)
elif scenario == "1D + scalar":
    A_def = rng.integers(1, 10, (5,)).astype(float)
    B_def = np.array([3.0])
elif scenario == "Column + Row → 2D":
    A_def = rng.integers(1, 10, (4, 1)).astype(float)
    B_def = rng.integers(1, 10, (1, 5)).astype(float)
else:
    with st.sidebar:
        ar = st.number_input("A rows", 1, 6, 3, key="ar")
        ac = st.number_input("A cols", 1, 6, 4, key="ac")
        br = st.number_input("B rows", 1, 6, 1, key="br")
        bc = st.number_input("B cols", 1, 6, 4, key="bc")
    A_def = rng.integers(1, 10, (int(ar), int(ac))).astype(float)
    B_def = rng.integers(1, 10, (int(br), int(bc))).astype(float)

with st.expander("✏️ Edit arrays", expanded=False):
    ec1, ec2 = st.columns(2)
    with ec1:
        A = array_input("A", A_def, "bc_a")
    with ec2:
        B = array_input("B", B_def, "bc_b")

# ── Broadcast ─────────────────────────────────────────────────
try:
    A_bc, B_bc = np.broadcast_arrays(A, B)
    result = op_fn(A, B)
    ok = True
except ValueError as e:
    ok = False
    err = str(e)

if not ok:
    st.error(f"❌ Shapes {A.shape} and {B.shape} are not broadcast-compatible: {err}")
    st.stop()

# 3 stages: originals → expanded → result
# Stage animation: 0 = originals, 1 = expanded, 2 = element-wise result building
total_cells = int(result.size)
STAGE_STEPS = [1, 1, total_cells]  # frames per stage
total = sum(STAGE_STEPS)
anim = Animator("broadcast", total_steps=total, speed=0.35)
anim.controls()

step = anim.current
# Determine stage
if step < STAGE_STEPS[0]:
    stage = 0
elif step < STAGE_STEPS[0] + STAGE_STEPS[1]:
    stage = 1
else:
    stage = 2
    cell_idx = step - STAGE_STEPS[0] - STAGE_STEPS[1]

# ── Stage 0: Originals ───────────────────────────────────────
if stage >= 0:
    st.markdown(f"### Stage 1 — Original shapes")
    d1, d2 = st.columns(2)
    with d1:
        st.markdown(f"**A** {shape_badge(A.shape)}", unsafe_allow_html=True)
        st.plotly_chart(array_heatmap(A, "A", annotation_fmt=".0f"), use_container_width=True)
    with d2:
        st.markdown(f"**B** {shape_badge(B.shape)}", unsafe_allow_html=True)
        st.plotly_chart(array_heatmap(B, "B", colorscale_key="purple", annotation_fmt=".0f"),
                        use_container_width=True)

# ── Stage 1: Broadcast expanded ──────────────────────────────
if stage >= 1:
    st.markdown("---")
    st.markdown("### Stage 2 — Virtual expansion (no copy)")
    d3, d4 = st.columns(2)
    with d3:
        st.markdown(f"**A** → {shape_badge(A_bc.shape)}", unsafe_allow_html=True)
        st.plotly_chart(array_heatmap(A_bc, "A (broadcast)", annotation_fmt=".0f"),
                        use_container_width=True)
    with d4:
        st.markdown(f"**B** → {shape_badge(B_bc.shape)}", unsafe_allow_html=True)
        st.plotly_chart(array_heatmap(B_bc, "B (broadcast)", colorscale_key="purple",
                                      annotation_fmt=".0f"),
                        use_container_width=True)

# ── Stage 2: Element-wise result building ─────────────────────
if stage >= 2:
    st.markdown("---")
    st.markdown("### Stage 3 — Element-wise result (building)")
    rows_r, cols_r = result.shape if result.ndim == 2 else (1, result.size)
    res2d = result.reshape(rows_r, cols_r) if result.ndim != 2 else result
    partial = np.full_like(res2d, np.nan)
    for idx in range(cell_idx + 1):
        r, cc = divmod(idx, cols_r)
        partial[r, cc] = res2d[r, cc]
    cr, ccc = divmod(cell_idx, cols_r)
    hl = [(cr, ccc)]
    st.plotly_chart(array_heatmap(partial, f"Result = A {op_sym} B", colorscale_key="amber",
                                  annotation_fmt=".0f", highlight_cells=hl, highlight_color=AMBER),
                    use_container_width=True)
    a_v = A_bc.reshape(rows_r, cols_r)[cr, ccc]
    b_v = B_bc.reshape(rows_r, cols_r)[cr, ccc]
    r_v = res2d[cr, ccc]
    formula_bar(f"[{cr},{ccc}]: {a_v:.0f} {op_sym} {b_v:.0f} = <b>{r_v:.0f}</b>", accent=AMBER)

st.code(f"result = A {op_sym} B   # shape {result.shape}", language="python")

with st.expander("📏 Broadcasting Rules"):
    st.markdown("""
1. Shapes are compared from the **trailing** dimension.
2. Dimensions of size **1** are stretched to match.
3. If sizes disagree and neither is 1 → **error**.
    """)

anim.maybe_advance()
