"""
Page 1 – Array Basics: creation, reshape, transpose, flatten.
"""

import streamlit as st
import numpy as np
from utils.theme import page_setup, get_colors, TEAL, PURPLE, AMBER
from utils.viz import array_heatmap, shape_badge, array_input
from utils.animator import Animator

page_setup("Array Basics", "🔢")
c = get_colors()

st.markdown(f'<h2 style="color:{TEAL};">🔢 Array Basics</h2>', unsafe_allow_html=True)
st.caption("Create arrays, reshape them, and see the memory layout change in real time.")
st.markdown("---")

with st.sidebar:
    st.subheader("Controls")
    operation = st.radio(
        "Operation",
        ["Create (arange)", "Create (random)", "Reshape", "Transpose", "Flatten / Ravel"],
    )

# ══════════════════════════════════════════════════════════════
if operation == "Create (arange)":
    col1, col2 = st.columns([1, 2])
    with col1:
        start = st.number_input("start", value=0, step=1)
        stop = st.number_input("stop", value=12, step=1)
        step_v = st.number_input("step", value=1, step=1, min_value=1)
    arr = np.arange(start, stop, step_v)
    with col1:
        st.markdown(f"**Shape:** {shape_badge(arr.shape)}", unsafe_allow_html=True)
        st.code(f"np.arange({start}, {stop}, {step_v})", language="python")
    with col2:
        st.plotly_chart(array_heatmap(arr, title="np.arange", annotation_fmt=".0f"),
                        use_container_width=True)

elif operation == "Create (random)":
    col1, col2 = st.columns([1, 2])
    with col1:
        rows = st.slider("Rows", 1, 8, 3)
        cols_n = st.slider("Cols", 1, 8, 4)
        dist = st.selectbox("Distribution", ["uniform [0,1)", "integers [0,10)", "normal μ=0 σ=1"])
        seed = st.number_input("Seed", value=42, step=1)
    rng = np.random.default_rng(int(seed))
    if dist.startswith("uniform"):
        arr = rng.random((rows, cols_n)); code = f"rng.random(({rows},{cols_n}))"; fmt = ".2f"
    elif dist.startswith("integers"):
        arr = rng.integers(0, 10, (rows, cols_n)); code = f"rng.integers(0,10,({rows},{cols_n}))"; fmt = ".0f"
    else:
        arr = rng.standard_normal((rows, cols_n)); code = f"rng.standard_normal(({rows},{cols_n}))"; fmt = ".2f"
    arr = array_input("Generated Array", arr.astype(float), "rand_arr")
    with col1:
        st.markdown(f"**Shape:** {shape_badge(arr.shape)}", unsafe_allow_html=True)
        st.code(code, language="python")
    with col2:
        st.plotly_chart(array_heatmap(arr, title="Array", annotation_fmt=fmt), use_container_width=True)

elif operation == "Reshape":
    col1, col2 = st.columns([1, 2])
    with col1:
        total = st.slider("Total elements", 4, 36, 12)
        arr_1d = np.arange(1, total + 1).astype(float)
        divisors = [d for d in range(1, total + 1) if total % d == 0]
        new_rows = st.selectbox("New rows", divisors, index=0)
        new_cols = total // new_rows
        st.markdown(f"**New shape:** {shape_badge((new_rows, new_cols))}", unsafe_allow_html=True)
        st.code(f"arr.reshape({new_rows}, {new_cols})", language="python")

    arr_2d = arr_1d.reshape(new_rows, new_cols)

    # Step-by-step: show elements filling into the new shape
    anim = Animator("reshape", total_steps=total)
    with col2:
        anim.controls()
        filled = np.full((new_rows, new_cols), np.nan)
        for idx in range(anim.current + 1):
            r, cc = divmod(idx, new_cols)
            filled[r, cc] = arr_1d[idx]
        hl = [divmod(anim.current, new_cols)]
        st.plotly_chart(array_heatmap(arr_1d, title=f"1-D  {arr_1d.shape}",
                                      annotation_fmt=".0f"), use_container_width=True)
        st.plotly_chart(array_heatmap(filled, title=f"Filling {new_rows}×{new_cols}",
                                      colorscale_key="amber", annotation_fmt=".0f",
                                      highlight_cells=hl, highlight_color=AMBER),
                        use_container_width=True)
    anim.maybe_advance()

elif operation == "Transpose":
    col1, col2 = st.columns([1, 2])
    with col1:
        rows = st.slider("Rows", 2, 6, 3)
        cols_n = st.slider("Cols", 2, 6, 4)
        seed = st.number_input("Seed", value=7, step=1)
    rng = np.random.default_rng(int(seed))
    arr = rng.integers(1, 20, (rows, cols_n)).astype(float)
    arr = array_input("Matrix", arr, "transpose_in")
    arr_t = arr.T
    with col1:
        st.markdown(f"**Original:** {shape_badge(arr.shape)}", unsafe_allow_html=True)
        st.markdown(f"**Transposed:** {shape_badge(arr_t.shape)}", unsafe_allow_html=True)
        st.code("arr.T", language="python")

    # Step-by-step: highlight corresponding cells
    total_cells = int(arr.size)
    anim = Animator("transpose", total_steps=total_cells)
    step = anim.current
    r, cc = divmod(step, arr.shape[1])
    with col2:
        anim.controls()
        d1, d2 = st.columns(2)
        with d1:
            st.plotly_chart(array_heatmap(arr, title="Original", annotation_fmt=".0f",
                                          highlight_cells=[(r, cc)], highlight_color=TEAL),
                            use_container_width=True)
        with d2:
            st.plotly_chart(array_heatmap(arr_t, title="Transposed", colorscale_key="purple",
                                          annotation_fmt=".0f",
                                          highlight_cells=[(cc, r)], highlight_color=PURPLE),
                            use_container_width=True)
        st.markdown(f"`arr[{r},{cc}] = {arr[r,cc]:.0f}` → `arr.T[{cc},{r}] = {arr_t[cc,r]:.0f}`")
    anim.maybe_advance()

elif operation == "Flatten / Ravel":
    col1, col2 = st.columns([1, 2])
    with col1:
        rows = st.slider("Rows", 2, 6, 3)
        cols_n = st.slider("Cols", 2, 6, 4)
        order = st.radio("Order", ["C (row-major)", "F (column-major)"])
        ord_char = "C" if order.startswith("C") else "F"
    arr = np.arange(1, rows * cols_n + 1).reshape(rows, cols_n).astype(float)
    flat = arr.flatten(order=ord_char)
    with col1:
        st.code(f"arr.flatten(order='{ord_char}')", language="python")

    anim = Animator("flatten", total_steps=int(arr.size))
    step = anim.current
    # Determine which cell corresponds to step in the given order
    if ord_char == "C":
        r, cc = divmod(step, cols_n)
    else:
        cc, r = divmod(step, rows)
    with col2:
        anim.controls()
        st.plotly_chart(array_heatmap(arr, title=f"2-D  {arr.shape}", annotation_fmt=".0f",
                                      highlight_cells=[(r, cc)], highlight_color=AMBER),
                        use_container_width=True)
        # Show flat array filling up to current step
        partial = np.full(arr.size, np.nan)
        for idx in range(step + 1):
            partial[idx] = flat[idx]
        st.plotly_chart(array_heatmap(partial, title=f"Flattened ({ord_char})",
                                      colorscale_key="amber", annotation_fmt=".0f"),
                        use_container_width=True)
    anim.maybe_advance()
