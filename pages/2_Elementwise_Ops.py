"""
Page 2 – Element-wise Operations: add, subtract, multiply, divide, power, modulo.
"""

import streamlit as st
import numpy as np
from utils.theme import CUSTOM_CSS, TEAL, PURPLE, AMBER
from utils.viz import (
    array_heatmap, shape_badge,
    COLORSCALE_TEAL, COLORSCALE_PURPLE, COLORSCALE_AMBER, COLORSCALE_DIVERGING,
)

st.set_page_config(page_title="Element-wise Ops", page_icon="➕", layout="wide")
st.markdown(CUSTOM_CSS, unsafe_allow_html=True)

st.markdown(f'<h2 style="color:{PURPLE};">➕ Element-wise Operations</h2>', unsafe_allow_html=True)
st.caption("Watch how operations apply independently to every matching cell.")
st.markdown("---")

# ── Sidebar ───────────────────────────────────────────────────
with st.sidebar:
    st.subheader("Array Setup")
    rows = st.slider("Rows", 2, 6, 3)
    cols_n = st.slider("Cols", 2, 6, 4)
    seed = st.number_input("Seed", value=42, step=1)
    st.markdown("---")
    op = st.radio(
        "Operation",
        ["Add (+)", "Subtract (−)", "Multiply (×)", "Divide (÷)",
         "Power (**)", "Modulo (%)", "Comparison (>)"],
    )
    st.markdown("---")
    mode = st.radio("Mode", ["Array ↔ Array", "Array ↔ Scalar"])
    if mode == "Array ↔ Scalar":
        scalar = st.number_input("Scalar value", value=2.0, step=0.5)

# ── Generate arrays ───────────────────────────────────────────
rng = np.random.default_rng(int(seed))
A = rng.integers(1, 10, (rows, cols_n)).astype(float)
B = rng.integers(1, 10, (rows, cols_n)).astype(float) if mode == "Array ↔ Array" else np.full((rows, cols_n), scalar)

# ── Compute ───────────────────────────────────────────────────
op_map = {
    "Add (+)": (np.add, "+", "np.add(A, B)"),
    "Subtract (−)": (np.subtract, "−", "np.subtract(A, B)"),
    "Multiply (×)": (np.multiply, "×", "np.multiply(A, B)"),
    "Divide (÷)": (np.divide, "÷", "np.divide(A, B)"),
    "Power (**)": (np.power, "**", "np.power(A, B)"),
    "Modulo (%)": (np.mod, "%", "np.mod(A, B)"),
    "Comparison (>)": (np.greater, ">", "np.greater(A, B)"),
}
fn, symbol, code_str = op_map[op]
with np.errstate(divide="ignore", invalid="ignore"):
    result = fn(A, B)

# ── Display ───────────────────────────────────────────────────
fmt = ".1f"
if op == "Comparison (>)":
    fmt = ".0f"
    result = result.astype(float)

col_a, col_op, col_b, col_eq, col_r = st.columns([3, 0.8, 3, 0.8, 3])

with col_a:
    st.plotly_chart(
        array_heatmap(A, title="A", colorscale=COLORSCALE_TEAL, annotation_fmt=fmt),
        use_container_width=True,
    )
with col_op:
    st.markdown(
        f'<div style="display:flex; align-items:center; justify-content:center; '
        f'height:250px; font-size:2.5rem; color:{TEAL}; font-weight:700;">{symbol}</div>',
        unsafe_allow_html=True,
    )
with col_b:
    st.plotly_chart(
        array_heatmap(B, title="B" if mode == "Array ↔ Array" else f"Scalar={scalar}",
                      colorscale=COLORSCALE_PURPLE, annotation_fmt=fmt),
        use_container_width=True,
    )
with col_eq:
    st.markdown(
        f'<div style="display:flex; align-items:center; justify-content:center; '
        f'height:250px; font-size:2.5rem; color:{AMBER}; font-weight:700;">=</div>',
        unsafe_allow_html=True,
    )
with col_r:
    st.plotly_chart(
        array_heatmap(result, title="Result", colorscale=COLORSCALE_AMBER, annotation_fmt=".2f"),
        use_container_width=True,
    )

# ── Code + Shape info ─────────────────────────────────────────
st.markdown("---")
c1, c2 = st.columns(2)
with c1:
    st.code(code_str, language="python")
with c2:
    st.markdown(
        f"**A** {shape_badge(A.shape)} &nbsp; {symbol} &nbsp; "
        f"**B** {shape_badge(B.shape)} &nbsp; → &nbsp; "
        f"**Result** {shape_badge(result.shape)}",
        unsafe_allow_html=True,
    )

# ── Cell-by-cell walkthrough ─────────────────────────────────
with st.expander("🔍 Cell-by-cell Walkthrough"):
    step_row = st.slider("Row", 0, rows - 1, 0, key="ew_row")
    step_col = st.slider("Col", 0, cols_n - 1, 0, key="ew_col")

    hl = [(step_row, step_col)]
    cc1, cc2, cc3 = st.columns(3)
    with cc1:
        st.plotly_chart(
            array_heatmap(A, title="A", colorscale=COLORSCALE_TEAL,
                          highlight_cells=hl, highlight_color=TEAL, annotation_fmt=fmt),
            use_container_width=True,
        )
    with cc2:
        st.plotly_chart(
            array_heatmap(B, title="B", colorscale=COLORSCALE_PURPLE,
                          highlight_cells=hl, highlight_color=PURPLE, annotation_fmt=fmt),
            use_container_width=True,
        )
    with cc3:
        st.plotly_chart(
            array_heatmap(result, title="Result", colorscale=COLORSCALE_AMBER,
                          highlight_cells=hl, highlight_color=AMBER, annotation_fmt=".2f"),
            use_container_width=True,
        )
    a_val = A[step_row, step_col]
    b_val = B[step_row, step_col]
    r_val = result[step_row, step_col]
    st.markdown(
        f"**Cell [{step_row}, {step_col}]:**  `{a_val:.1f} {symbol} {b_val:.1f} = {r_val:.2f}`"
    )
