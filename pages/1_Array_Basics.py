"""
Page 1 – Array Basics: creation, reshape, transpose, flatten.
"""

import streamlit as st
import numpy as np
from utils.theme import CUSTOM_CSS, TEAL, PURPLE, AMBER
from utils.viz import array_heatmap, shape_badge, code_block, COLORSCALE_TEAL, COLORSCALE_PURPLE, COLORSCALE_AMBER

st.set_page_config(page_title="Array Basics", page_icon="🔢", layout="wide")
st.markdown(CUSTOM_CSS, unsafe_allow_html=True)

st.markdown(f'<h2 style="color:{TEAL};">🔢 Array Basics</h2>', unsafe_allow_html=True)
st.caption("Create arrays, reshape them, and see the memory layout change in real time.")
st.markdown("---")

# ── Sidebar Controls ──────────────────────────────────────────
with st.sidebar:
    st.subheader("Controls")
    operation = st.radio(
        "Operation",
        ["Create (arange)", "Create (random)", "Reshape", "Transpose", "Flatten / Ravel"],
        index=0,
    )

# ══════════════════════════════════════════════════════════════
if operation == "Create (arange)":
    col1, col2 = st.columns([1, 2])
    with col1:
        start = st.number_input("start", value=0, step=1)
        stop = st.number_input("stop", value=12, step=1)
        step = st.number_input("step", value=1, step=1, min_value=1)
    arr = np.arange(start, stop, step)
    with col1:
        st.markdown(f"**Shape:** {shape_badge(arr.shape)}", unsafe_allow_html=True)
        st.code(f"np.arange({start}, {stop}, {step})", language="python")
    with col2:
        st.plotly_chart(
            array_heatmap(arr, title="np.arange output", annotation_fmt=".0f"),
            use_container_width=True,
        )

# ──────────────────────────────────────────────────────────────
elif operation == "Create (random)":
    col1, col2 = st.columns([1, 2])
    with col1:
        rows = st.slider("Rows", 1, 8, 3)
        cols_n = st.slider("Cols", 1, 8, 4)
        dist = st.selectbox("Distribution", ["uniform [0,1)", "integers [0,10)", "normal μ=0 σ=1"])
        seed = st.number_input("Seed", value=42, step=1)
    rng = np.random.default_rng(int(seed))
    if dist.startswith("uniform"):
        arr = rng.random((rows, cols_n))
        code = f"rng.random(({rows}, {cols_n}))"
        fmt = ".2f"
    elif dist.startswith("integers"):
        arr = rng.integers(0, 10, (rows, cols_n))
        code = f"rng.integers(0, 10, ({rows}, {cols_n}))"
        fmt = ".0f"
    else:
        arr = rng.standard_normal((rows, cols_n))
        code = f"rng.standard_normal(({rows}, {cols_n}))"
        fmt = ".2f"
    with col1:
        st.markdown(f"**Shape:** {shape_badge(arr.shape)}", unsafe_allow_html=True)
        st.code(code, language="python")
    with col2:
        st.plotly_chart(
            array_heatmap(arr, title="Random Array", annotation_fmt=fmt),
            use_container_width=True,
        )

# ──────────────────────────────────────────────────────────────
elif operation == "Reshape":
    col1, col2 = st.columns([1, 2])
    with col1:
        total = st.slider("Total elements", 4, 36, 12)
        arr_1d = np.arange(1, total + 1)
        st.markdown(f"**1-D array:** `np.arange(1, {total + 1})`")
        # Find valid reshape targets
        divisors = [d for d in range(1, total + 1) if total % d == 0]
        new_rows = st.selectbox("New rows", divisors, index=0)
        new_cols = total // new_rows
        st.markdown(f"**New shape:** {shape_badge((new_rows, new_cols))}", unsafe_allow_html=True)
        st.code(f"arr.reshape({new_rows}, {new_cols})", language="python")

    arr_2d = arr_1d.reshape(new_rows, new_cols)
    with col2:
        st.plotly_chart(
            array_heatmap(arr_1d, title=f"Original  shape={arr_1d.shape}", annotation_fmt=".0f"),
            use_container_width=True,
        )
        st.plotly_chart(
            array_heatmap(arr_2d, title=f"Reshaped  shape={arr_2d.shape}",
                          colorscale=COLORSCALE_AMBER, annotation_fmt=".0f"),
            use_container_width=True,
        )

    # Memory order explanation
    with st.expander("💡 How reshape works in memory"):
        st.markdown(
            "NumPy stores arrays in **row-major (C)** order by default. "
            "`reshape` does not copy data – it just changes how the flat buffer is "
            "interpreted as rows and columns. The values flow left→right, top→bottom."
        )

# ──────────────────────────────────────────────────────────────
elif operation == "Transpose":
    col1, col2 = st.columns([1, 2])
    with col1:
        rows = st.slider("Rows", 2, 6, 3)
        cols_n = st.slider("Cols", 2, 6, 4)
        seed = st.number_input("Seed", value=7, step=1)
    rng = np.random.default_rng(int(seed))
    arr = rng.integers(1, 20, (rows, cols_n))
    arr_t = arr.T
    with col1:
        st.markdown(f"**Original:** {shape_badge(arr.shape)}", unsafe_allow_html=True)
        st.markdown(f"**Transposed:** {shape_badge(arr_t.shape)}", unsafe_allow_html=True)
        st.code("arr.T  # or np.transpose(arr)", language="python")
    with col2:
        st.plotly_chart(
            array_heatmap(arr, title=f"Original  {arr.shape}", annotation_fmt=".0f"),
            use_container_width=True,
        )
        st.plotly_chart(
            array_heatmap(arr_t, title=f"Transposed  {arr_t.shape}",
                          colorscale=COLORSCALE_PURPLE, annotation_fmt=".0f"),
            use_container_width=True,
        )

# ──────────────────────────────────────────────────────────────
elif operation == "Flatten / Ravel":
    col1, col2 = st.columns([1, 2])
    with col1:
        rows = st.slider("Rows", 2, 6, 3)
        cols_n = st.slider("Cols", 2, 6, 4)
        order = st.radio("Order", ["C (row-major)", "F (column-major)"])
        ord_char = "C" if order.startswith("C") else "F"
    arr = np.arange(1, rows * cols_n + 1).reshape(rows, cols_n)
    flat = arr.flatten(order=ord_char)
    with col1:
        st.code(f"arr.flatten(order='{ord_char}')", language="python")
        st.markdown(f"**Result shape:** {shape_badge(flat.shape)}", unsafe_allow_html=True)
    with col2:
        st.plotly_chart(
            array_heatmap(arr, title=f"2-D  {arr.shape}", annotation_fmt=".0f"),
            use_container_width=True,
        )
        st.plotly_chart(
            array_heatmap(flat, title=f"Flattened ({ord_char}-order)  {flat.shape}",
                          colorscale=COLORSCALE_AMBER, annotation_fmt=".0f"),
            use_container_width=True,
        )
    with st.expander("💡 C vs F order"):
        st.markdown(
            "**C order** reads elements row by row (left→right, top→bottom). "
            "**F order** (Fortran) reads column by column (top→bottom, left→right)."
        )
