"""
Page 5 – Slicing & Indexing: basic slices, fancy indexing, boolean masks.
"""

import streamlit as st
import numpy as np
from utils.theme import CUSTOM_CSS, TEAL, PURPLE, AMBER, CYAN, CORAL
from utils.viz import (
    array_heatmap, shape_badge,
    COLORSCALE_TEAL, COLORSCALE_PURPLE, COLORSCALE_AMBER,
)

st.set_page_config(page_title="Slicing & Indexing", page_icon="✂️", layout="wide")
st.markdown(CUSTOM_CSS, unsafe_allow_html=True)

st.markdown(f'<h2 style="color:{CYAN};">✂️ Slicing & Indexing</h2>', unsafe_allow_html=True)
st.caption("Highlight sub-arrays, use fancy indexing, and apply boolean masks.")
st.markdown("---")

# ── Sidebar ───────────────────────────────────────────────────
with st.sidebar:
    st.subheader("Controls")
    mode = st.radio("Mode", ["Basic Slice", "Fancy Indexing", "Boolean Mask", "Stride Tricks"])
    st.markdown("---")
    rows = st.slider("Array rows", 3, 8, 5)
    cols_n = st.slider("Array cols", 3, 8, 6)
    seed = st.number_input("Seed", value=9, step=1)

rng = np.random.default_rng(int(seed))
arr = rng.integers(1, 50, (rows, cols_n)).astype(float)

# ══════════════════════════════════════════════════════════════
if mode == "Basic Slice":
    st.markdown("### Basic Slicing `arr[r_start:r_stop, c_start:c_stop]`")
    with st.sidebar:
        r_start = st.slider("row start", 0, rows - 1, 0)
        r_stop = st.slider("row stop", r_start + 1, rows, min(r_start + 3, rows))
        c_start = st.slider("col start", 0, cols_n - 1, 0)
        c_stop = st.slider("col stop", c_start + 1, cols_n, min(c_start + 3, cols_n))

    row_sl = slice(r_start, r_stop)
    col_sl = slice(c_start, c_stop)
    sub = arr[row_sl, col_sl]

    hl = [(r, c) for r in range(r_start, r_stop) for c in range(c_start, c_stop)]

    c1, c2 = st.columns(2)
    with c1:
        st.plotly_chart(
            array_heatmap(arr, title="Original (selected region highlighted)",
                          annotation_fmt=".0f", highlight_cells=hl, highlight_color=AMBER),
            use_container_width=True,
        )
    with c2:
        st.plotly_chart(
            array_heatmap(sub, title=f"Sliced Result  {sub.shape}",
                          colorscale=COLORSCALE_AMBER, annotation_fmt=".0f"),
            use_container_width=True,
        )
    st.code(f"arr[{r_start}:{r_stop}, {c_start}:{c_stop}]", language="python")

# ──────────────────────────────────────────────────────────────
elif mode == "Fancy Indexing":
    st.markdown("### Fancy Indexing — select specific rows & columns by index")
    with st.sidebar:
        sel_rows = st.multiselect("Select rows", list(range(rows)), default=[0, 2])
        sel_cols = st.multiselect("Select cols", list(range(cols_n)), default=[1, 3, 4])

    if sel_rows and sel_cols:
        sub = arr[np.ix_(sel_rows, sel_cols)]
        hl = [(r, c) for r in sel_rows for c in sel_cols]

        c1, c2 = st.columns(2)
        with c1:
            st.plotly_chart(
                array_heatmap(arr, title="Original", annotation_fmt=".0f",
                              highlight_cells=hl, highlight_color=PURPLE),
                use_container_width=True,
            )
        with c2:
            st.plotly_chart(
                array_heatmap(sub, title=f"Fancy-indexed  {sub.shape}",
                              colorscale=COLORSCALE_PURPLE, annotation_fmt=".0f"),
                use_container_width=True,
            )
        st.code(f"arr[np.ix_({sel_rows}, {sel_cols})]", language="python")
    else:
        st.info("Select at least one row and one column from the sidebar.")

# ──────────────────────────────────────────────────────────────
elif mode == "Boolean Mask":
    st.markdown("### Boolean Mask — filter values by condition")
    with st.sidebar:
        cond = st.selectbox("Condition", ["> threshold", "< threshold", "even values", "odd values"])
        if cond.endswith("threshold"):
            thresh = st.slider("Threshold", int(arr.min()), int(arr.max()), int(arr.mean()))

    if cond == "> threshold":
        mask = arr > thresh
        code_str = f"arr[arr > {thresh}]"
    elif cond == "< threshold":
        mask = arr < thresh
        code_str = f"arr[arr < {thresh}]"
    elif cond == "even values":
        mask = (arr % 2 == 0)
        code_str = "arr[arr % 2 == 0]"
    else:
        mask = (arr % 2 == 1)
        code_str = "arr[arr % 2 == 1]"

    hl = [(i, j) for i in range(rows) for j in range(cols_n) if mask[i, j]]
    selected = arr[mask]

    c1, c2 = st.columns(2)
    with c1:
        st.plotly_chart(
            array_heatmap(arr, title="Original (matching cells highlighted)",
                          annotation_fmt=".0f", highlight_cells=hl, highlight_color=CORAL),
            use_container_width=True,
        )
    with c2:
        # Show mask as 0/1
        st.plotly_chart(
            array_heatmap(mask.astype(float), title="Boolean Mask (True=1)",
                          colorscale=COLORSCALE_PURPLE, annotation_fmt=".0f"),
            use_container_width=True,
        )

    st.markdown(f"**Selected values** ({len(selected)} elements):")
    st.plotly_chart(
        array_heatmap(selected, title=f"Flat result  shape=({len(selected)},)",
                      colorscale=COLORSCALE_AMBER, annotation_fmt=".0f"),
        use_container_width=True,
    )
    st.code(code_str, language="python")

# ──────────────────────────────────────────────────────────────
elif mode == "Stride Tricks":
    st.markdown("### Stride / Step Slicing  `arr[::row_step, ::col_step]`")
    with st.sidebar:
        row_step = st.slider("Row step", 1, max(rows // 2, 2), 2)
        col_step = st.slider("Col step", 1, max(cols_n // 2, 2), 2)

    sub = arr[::row_step, ::col_step]
    hl = [(r, c) for r in range(0, rows, row_step) for c in range(0, cols_n, col_step)]

    c1, c2 = st.columns(2)
    with c1:
        st.plotly_chart(
            array_heatmap(arr, title="Original", annotation_fmt=".0f",
                          highlight_cells=hl, highlight_color=TEAL),
            use_container_width=True,
        )
    with c2:
        st.plotly_chart(
            array_heatmap(sub, title=f"Strided  {sub.shape}",
                          colorscale=COLORSCALE_AMBER, annotation_fmt=".0f"),
            use_container_width=True,
        )
    st.code(f"arr[::{row_step}, ::{col_step}]", language="python")
