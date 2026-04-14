"""
Page 4 – Broadcasting: visualize how NumPy stretches arrays to compatible shapes.
"""

import streamlit as st
import numpy as np
from utils.theme import CUSTOM_CSS, TEAL, PURPLE, AMBER, CORAL, CYAN
from utils.viz import (
    array_heatmap, shape_badge,
    COLORSCALE_TEAL, COLORSCALE_PURPLE, COLORSCALE_AMBER,
)

st.set_page_config(page_title="Broadcasting", page_icon="📡", layout="wide")
st.markdown(CUSTOM_CSS, unsafe_allow_html=True)

st.markdown(f'<h2 style="color:{CORAL};">📡 Broadcasting</h2>', unsafe_allow_html=True)
st.caption("See how NumPy stretches arrays to make shapes compatible for element-wise ops.")
st.markdown("---")

# ── Sidebar ───────────────────────────────────────────────────
with st.sidebar:
    st.subheader("Preset Scenarios")
    scenario = st.radio(
        "Pick a case",
        [
            "2D + 1D row vector",
            "2D + 1D column vector",
            "1D + scalar",
            "Column + Row → 2D",
            "Custom shapes",
        ],
    )
    st.markdown("---")
    seed = st.number_input("Seed", value=5, step=1)
    op_choice = st.selectbox("Operation", ["+", "×", "−"])

rng = np.random.default_rng(int(seed))
op_fn = {"+" : np.add, "×": np.multiply, "−": np.subtract}[op_choice]

# ── Build arrays based on scenario ────────────────────────────
if scenario == "2D + 1D row vector":
    A = rng.integers(1, 10, (3, 4)).astype(float)
    B = rng.integers(1, 10, (4,)).astype(float)
elif scenario == "2D + 1D column vector":
    A = rng.integers(1, 10, (4, 3)).astype(float)
    B = rng.integers(1, 10, (4, 1)).astype(float)
elif scenario == "1D + scalar":
    A = rng.integers(1, 10, (5,)).astype(float)
    B = np.array([3.0])
elif scenario == "Column + Row → 2D":
    A = rng.integers(1, 10, (4, 1)).astype(float)
    B = rng.integers(1, 10, (1, 5)).astype(float)
else:
    with st.sidebar:
        st.markdown("**Array A shape**")
        a_rows = st.number_input("A rows", 1, 6, 3, key="ar")
        a_cols = st.number_input("A cols", 1, 6, 4, key="ac")
        st.markdown("**Array B shape**")
        b_rows = st.number_input("B rows", 1, 6, 1, key="br")
        b_cols = st.number_input("B cols", 1, 6, 4, key="bc")
    A = rng.integers(1, 10, (int(a_rows), int(a_cols))).astype(float)
    B = rng.integers(1, 10, (int(b_rows), int(b_cols))).astype(float)

# ── Attempt broadcast ─────────────────────────────────────────
try:
    A_bc, B_bc = np.broadcast_arrays(A, B)
    result = op_fn(A, B)
    broadcast_ok = True
except ValueError as e:
    broadcast_ok = False
    error_msg = str(e)

# ── Display ───────────────────────────────────────────────────
if broadcast_ok:
    # Step 1: Original shapes
    st.markdown("### Step 1 — Original Arrays")
    c1, c2 = st.columns(2)
    with c1:
        st.markdown(f"**A** &nbsp; {shape_badge(A.shape)}", unsafe_allow_html=True)
        st.plotly_chart(array_heatmap(A, title="A (original)", annotation_fmt=".0f"),
                        use_container_width=True)
    with c2:
        st.markdown(f"**B** &nbsp; {shape_badge(B.shape)}", unsafe_allow_html=True)
        st.plotly_chart(array_heatmap(B, title="B (original)", colorscale=COLORSCALE_PURPLE,
                                      annotation_fmt=".0f"),
                        use_container_width=True)

    st.markdown("---")

    # Step 2: Broadcast expansion
    st.markdown("### Step 2 — After Broadcasting (virtual expansion)")
    st.markdown(
        f"NumPy stretches dimensions of size **1** to match the other array. "
        f"No data is actually copied — this is a *virtual* expansion."
    )
    c3, c4 = st.columns(2)
    with c3:
        st.markdown(f"**A broadcast** &nbsp; {shape_badge(A_bc.shape)}", unsafe_allow_html=True)
        st.plotly_chart(array_heatmap(A_bc, title="A (broadcast)", annotation_fmt=".0f"),
                        use_container_width=True)
    with c4:
        st.markdown(f"**B broadcast** &nbsp; {shape_badge(B_bc.shape)}", unsafe_allow_html=True)
        st.plotly_chart(array_heatmap(B_bc, title="B (broadcast)", colorscale=COLORSCALE_PURPLE,
                                      annotation_fmt=".0f"),
                        use_container_width=True)

    st.markdown("---")

    # Step 3: Result
    st.markdown("### Step 3 — Result")
    st.markdown(f"**Result** &nbsp; {shape_badge(result.shape)}", unsafe_allow_html=True)
    st.plotly_chart(array_heatmap(result, title=f"A {op_choice} B", colorscale=COLORSCALE_AMBER,
                                  annotation_fmt=".0f"),
                    use_container_width=True)
    st.code(f"result = A {op_choice} B   # shape {result.shape}", language="python")

    # Broadcasting rules
    with st.expander("📏 Broadcasting Rules"):
        st.markdown("""
**NumPy broadcasting compares shapes element-wise from the trailing dimension:**

1. If the arrays differ in number of dimensions, the shape of the smaller one is padded with 1s on the left.
2. Arrays with size 1 along a particular dimension act as if they had the size of the array with the largest shape along that dimension.
3. If sizes disagree and neither is 1, an error is raised.

**Example:** `(3, 4) + (4,)` → B is treated as `(1, 4)` → broadcast to `(3, 4)`.
        """)

else:
    st.error(f"❌ Broadcasting failed: {error_msg}")
    c1, c2 = st.columns(2)
    with c1:
        st.markdown(f"**A** shape = {A.shape}")
        st.plotly_chart(array_heatmap(A, title="A", annotation_fmt=".0f"), use_container_width=True)
    with c2:
        st.markdown(f"**B** shape = {B.shape}")
        st.plotly_chart(array_heatmap(B, title="B", colorscale=COLORSCALE_PURPLE,
                                      annotation_fmt=".0f"), use_container_width=True)
    st.markdown(
        f"Shapes **{A.shape}** and **{B.shape}** are not broadcast-compatible. "
        f"Adjust the dimensions so that each axis is either equal or one of them is 1."
    )
