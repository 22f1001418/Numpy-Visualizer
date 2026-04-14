"""
Page 7 – Stacking & Splitting: vstack, hstack, concatenate, split.
"""

import streamlit as st
import numpy as np
from utils.theme import page_setup, get_colors, TEAL, PURPLE, AMBER, CYAN
from utils.viz import array_heatmap, shape_badge, array_input, formula_bar
from utils.animator import Animator

page_setup("Stacking & Splitting", "📐")
c = get_colors()

st.markdown(f'<h2 style="color:{PURPLE};">📐 Stacking & Splitting</h2>', unsafe_allow_html=True)
st.caption("See shapes merge and divide — row by row and column by column.")
st.markdown("---")

with st.sidebar:
    st.subheader("Operation")
    op = st.radio("Choose", [
        "vstack (vertical)", "hstack (horizontal)",
        "concatenate", "split (vertical)", "split (horizontal)",
    ])
    st.markdown("---")
    seed = st.number_input("Seed", value=3, step=1)

rng = np.random.default_rng(int(seed))

# ══════════════════════════════════════════════════════════════
if op == "vstack (vertical)":
    with st.sidebar:
        cols_n = st.slider("Columns (shared)", 2, 6, 4)
        rows_a = st.slider("A rows", 1, 4, 2)
        rows_b = st.slider("B rows", 1, 4, 3)
    A = rng.integers(1, 10, (rows_a, cols_n)).astype(float)
    B = rng.integers(10, 20, (rows_b, cols_n)).astype(float)

    with st.expander("✏️ Edit", expanded=False):
        ec1, ec2 = st.columns(2)
        with ec1: A = array_input("A", A, "vs_a")
        with ec2: B = array_input("B", B, "vs_b")

    result = np.vstack([A, B])
    total_rows = result.shape[0]
    anim = Animator("vstack", total_steps=total_rows, speed=0.5)
    anim.controls()

    d1, d2, d3 = st.columns(3)
    with d1:
        st.plotly_chart(array_heatmap(A, f"A {A.shape}", annotation_fmt=".0f"), use_container_width=True)
    with d2:
        st.plotly_chart(array_heatmap(B, f"B {B.shape}", colorscale_key="purple",
                                      annotation_fmt=".0f"), use_container_width=True)
    with d3:
        partial = np.full_like(result, np.nan)
        for r in range(anim.current + 1):
            partial[r, :] = result[r, :]
        hl = [(anim.current, cc) for cc in range(result.shape[1])]
        st.plotly_chart(array_heatmap(partial, f"vstack → {result.shape}", colorscale_key="amber",
                                      annotation_fmt=".0f", highlight_cells=hl, highlight_color=AMBER),
                        use_container_width=True)
    origin = "A" if anim.current < A.shape[0] else "B"
    formula_bar(f"Row {anim.current} comes from <b>{origin}</b>", accent=AMBER)
    st.code("np.vstack([A, B])", language="python")
    anim.maybe_advance()

elif op == "hstack (horizontal)":
    with st.sidebar:
        rows_n = st.slider("Rows (shared)", 2, 6, 3)
        cols_a = st.slider("A cols", 1, 4, 2)
        cols_b = st.slider("B cols", 1, 4, 3)
    A = rng.integers(1, 10, (rows_n, cols_a)).astype(float)
    B = rng.integers(10, 20, (rows_n, cols_b)).astype(float)

    with st.expander("✏️ Edit", expanded=False):
        ec1, ec2 = st.columns(2)
        with ec1: A = array_input("A", A, "hs_a")
        with ec2: B = array_input("B", B, "hs_b")

    result = np.hstack([A, B])
    total_cols = result.shape[1]
    anim = Animator("hstack", total_steps=total_cols, speed=0.5)
    anim.controls()

    d1, d2, d3 = st.columns(3)
    with d1:
        st.plotly_chart(array_heatmap(A, f"A {A.shape}", annotation_fmt=".0f"), use_container_width=True)
    with d2:
        st.plotly_chart(array_heatmap(B, f"B {B.shape}", colorscale_key="purple",
                                      annotation_fmt=".0f"), use_container_width=True)
    with d3:
        partial = np.full_like(result, np.nan)
        for cc in range(anim.current + 1):
            partial[:, cc] = result[:, cc]
        hl = [(r, anim.current) for r in range(result.shape[0])]
        st.plotly_chart(array_heatmap(partial, f"hstack → {result.shape}", colorscale_key="amber",
                                      annotation_fmt=".0f", highlight_cells=hl, highlight_color=AMBER),
                        use_container_width=True)
    origin = "A" if anim.current < A.shape[1] else "B"
    formula_bar(f"Col {anim.current} comes from <b>{origin}</b>", accent=AMBER)
    st.code("np.hstack([A, B])", language="python")
    anim.maybe_advance()

elif op == "concatenate":
    with st.sidebar:
        ax = st.radio("Axis", [0, 1])
        if ax == 0:
            cols_n = st.slider("Shared cols", 2, 6, 4)
            A = rng.integers(1, 10, (2, cols_n)).astype(float)
            B = rng.integers(10, 20, (3, cols_n)).astype(float)
        else:
            rows_n = st.slider("Shared rows", 2, 6, 3)
            A = rng.integers(1, 10, (rows_n, 2)).astype(float)
            B = rng.integers(10, 20, (rows_n, 3)).astype(float)
    result = np.concatenate([A, B], axis=ax)
    d1, d2, d3 = st.columns(3)
    with d1:
        st.plotly_chart(array_heatmap(A, f"A {A.shape}", annotation_fmt=".0f"), use_container_width=True)
    with d2:
        st.plotly_chart(array_heatmap(B, f"B {B.shape}", colorscale_key="purple",
                                      annotation_fmt=".0f"), use_container_width=True)
    with d3:
        st.plotly_chart(array_heatmap(result, f"concat(axis={ax}) → {result.shape}",
                                      colorscale_key="amber", annotation_fmt=".0f"),
                        use_container_width=True)
    st.code(f"np.concatenate([A, B], axis={ax})", language="python")

elif op.startswith("split"):
    vertical = "vertical" in op
    with st.sidebar:
        rows_n = st.slider("Rows", 4, 8, 6)
        cols_n = st.slider("Cols", 4, 8, 6)
        n_splits = st.slider("Splits", 2, 4, 2 if vertical else 3)
    arr = rng.integers(1, 20, (rows_n, cols_n)).astype(float)
    ax = 0 if vertical else 1
    try:
        parts = np.split(arr, n_splits, axis=ax)
    except ValueError:
        st.error(f"Cannot split axis {ax} (size {arr.shape[ax]}) into {n_splits} equal parts.")
        st.stop()

    st.plotly_chart(array_heatmap(arr, f"Original {arr.shape}", annotation_fmt=".0f"),
                    use_container_width=True)
    st.markdown(f"**Split into {n_splits} parts along axis={ax}:**")
    cols = st.columns(n_splits)
    for i, part in enumerate(parts):
        with cols[i]:
            st.plotly_chart(array_heatmap(part, f"Part {i}  {part.shape}",
                                          colorscale_key=["teal", "purple", "amber", "teal"][i % 4],
                                          annotation_fmt=".0f"), use_container_width=True)
    st.code(f"np.split(arr, {n_splits}, axis={ax})", language="python")
