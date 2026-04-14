"""
Page 2 – Element-wise Operations with animated cell-by-cell walkthrough.
"""

import streamlit as st
import numpy as np
from utils.theme import page_setup, get_colors, TEAL, PURPLE, AMBER
from utils.viz import array_heatmap, shape_badge, array_input, formula_bar
from utils.animator import Animator

page_setup("Element-wise Ops", "➕")
c = get_colors()

st.markdown(f'<h2 style="color:{PURPLE};">➕ Element-wise Operations</h2>', unsafe_allow_html=True)
st.caption("Watch operations apply independently to every matching cell — animated step by step.")
st.markdown("---")

# ── Sidebar ───────────────────────────────────────────────────
with st.sidebar:
    st.subheader("Array Setup")
    rows = st.slider("Rows", 2, 6, 3)
    cols_n = st.slider("Cols", 2, 6, 4)
    seed = st.number_input("Seed", value=42, step=1)
    st.markdown("---")
    op = st.radio("Operation",
                  ["Add (+)", "Subtract (−)", "Multiply (×)", "Divide (÷)",
                   "Power (**)", "Modulo (%)", "Floor Divide (//)", "Comparison (>)"])
    st.markdown("---")
    mode = st.radio("Mode", ["Array ↔ Array", "Array ↔ Scalar"])
    if mode == "Array ↔ Scalar":
        scalar = st.number_input("Scalar", value=2.0, step=0.5)

# ── Generate / input arrays ───────────────────────────────────
rng = np.random.default_rng(int(seed))
A_default = rng.integers(1, 10, (rows, cols_n)).astype(float)
B_default = rng.integers(1, 10, (rows, cols_n)).astype(float) if mode == "Array ↔ Array" \
    else np.full((rows, cols_n), scalar)

with st.expander("✏️ Edit input arrays", expanded=False):
    ec1, ec2 = st.columns(2)
    with ec1:
        A = array_input("Array A", A_default, "ew_a")
    with ec2:
        if mode == "Array ↔ Array":
            B = array_input("Array B", B_default, "ew_b")
        else:
            B = np.full(A.shape, scalar)
            st.markdown(f"**B** = scalar `{scalar}` broadcast to `{A.shape}`")

# ── Compute ───────────────────────────────────────────────────
op_map = {
    "Add (+)":          (np.add,           "+",  "np.add(A, B)"),
    "Subtract (−)":     (np.subtract,      "−",  "np.subtract(A, B)"),
    "Multiply (×)":     (np.multiply,      "×",  "np.multiply(A, B)"),
    "Divide (÷)":       (np.divide,        "÷",  "np.divide(A, B)"),
    "Power (**)":       (np.power,         "**", "np.power(A, B)"),
    "Modulo (%)":       (np.mod,           "%",  "np.mod(A, B)"),
    "Floor Divide (//)": (np.floor_divide, "//", "np.floor_divide(A, B)"),
    "Comparison (>)":   (np.greater,       ">",  "np.greater(A, B)"),
}
fn, symbol, code_str = op_map[op]
with np.errstate(divide="ignore", invalid="ignore"):
    result = fn(A, B)
if op == "Comparison (>)":
    result = result.astype(float)
fmt = ".0f" if op == "Comparison (>)" else ".1f"

# ── Static overview ───────────────────────────────────────────
ca, cop, cb, ceq, cr = st.columns([3, 0.6, 3, 0.6, 3])
with ca:
    st.plotly_chart(array_heatmap(A, "A", annotation_fmt=fmt), use_container_width=True)
with cop:
    st.markdown(f'<div style="display:flex;align-items:center;justify-content:center;'
                f'height:220px;font-size:2.2rem;color:{TEAL};font-weight:700;">{symbol}</div>',
                unsafe_allow_html=True)
with cb:
    st.plotly_chart(array_heatmap(B, "B", colorscale_key="purple", annotation_fmt=fmt),
                    use_container_width=True)
with ceq:
    st.markdown(f'<div style="display:flex;align-items:center;justify-content:center;'
                f'height:220px;font-size:2.2rem;color:{AMBER};font-weight:700;">=</div>',
                unsafe_allow_html=True)
with cr:
    st.plotly_chart(array_heatmap(result, "Result", colorscale_key="amber", annotation_fmt=".2f"),
                    use_container_width=True)

st.code(code_str, language="python")
st.markdown("---")

# ── Animated step-by-step ─────────────────────────────────────
st.markdown("### 🎬 Step-by-step Animation")
total_cells = int(A.shape[0] * A.shape[1])
anim = Animator("ew_step", total_steps=total_cells, speed=0.45)
anim.controls()

step = anim.current
sr, sc = divmod(step, A.shape[1])
hl = [(sr, sc)]

# Build partial result (cells computed so far)
partial = np.full_like(result, np.nan)
for idx in range(step + 1):
    r, cc = divmod(idx, A.shape[1])
    partial[r, cc] = result[r, cc]

d1, d2, d3 = st.columns(3)
with d1:
    st.plotly_chart(array_heatmap(A, "A", highlight_cells=hl, highlight_color=TEAL,
                                  annotation_fmt=fmt), use_container_width=True)
with d2:
    st.plotly_chart(array_heatmap(B, "B", colorscale_key="purple", highlight_cells=hl,
                                  highlight_color=PURPLE, annotation_fmt=fmt),
                    use_container_width=True)
with d3:
    st.plotly_chart(array_heatmap(partial, "Result (building…)", colorscale_key="amber",
                                  highlight_cells=hl, highlight_color=AMBER,
                                  annotation_fmt=".2f"),
                    use_container_width=True)

a_val = A[sr, sc]
b_val = B[sr, sc]
r_val = result[sr, sc]
formula_bar(f"Cell [{sr}, {sc}]: &nbsp; <b>{a_val:.1f} {symbol} {b_val:.1f} = {r_val:.2f}</b>",
            accent=AMBER)

anim.maybe_advance()
