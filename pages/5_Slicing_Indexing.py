"""
Page 5 – Slicing & Indexing: basic, fancy, boolean, strides, np.where.
"""

import streamlit as st
import numpy as np
from utils.theme import page_setup, get_colors, TEAL, PURPLE, AMBER, CYAN, CORAL
from utils.viz import array_heatmap, shape_badge, array_input, formula_bar
from utils.animator import Animator

page_setup("Slicing & Indexing", "✂️")
c = get_colors()

st.markdown(f'<h2 style="color:{CYAN};">✂️ Slicing & Indexing</h2>', unsafe_allow_html=True)
st.caption("Highlight sub-arrays, fancy indexing, boolean masks, and np.where.")
st.markdown("---")

with st.sidebar:
    st.subheader("Controls")
    mode = st.radio("Mode", ["Basic Slice", "Fancy Indexing", "Boolean Mask",
                              "Stride Tricks", "np.where"])
    st.markdown("---")
    rows = st.slider("Rows", 3, 8, 5)
    cols_n = st.slider("Cols", 3, 8, 6)
    seed = st.number_input("Seed", value=9, step=1)

rng = np.random.default_rng(int(seed))
arr_def = rng.integers(1, 50, (rows, cols_n)).astype(float)

with st.expander("✏️ Edit source array", expanded=False):
    arr = array_input("Source", arr_def, "sl_src")
rows, cols_n = arr.shape  # may have been edited

# ══════════════════════════════════════════════════════════════
if mode == "Basic Slice":
    with st.sidebar:
        r_start = st.slider("row start", 0, rows - 1, 0)
        r_stop = st.slider("row stop", r_start + 1, rows, min(r_start + 3, rows))
        c_start = st.slider("col start", 0, cols_n - 1, 0)
        c_stop = st.slider("col stop", c_start + 1, cols_n, min(c_start + 3, cols_n))

    sub = arr[r_start:r_stop, c_start:c_stop]
    hl = [(r, cc) for r in range(r_start, r_stop) for cc in range(c_start, c_stop)]

    d1, d2 = st.columns(2)
    with d1:
        st.plotly_chart(array_heatmap(arr, "Original", annotation_fmt=".0f",
                                      highlight_cells=hl, highlight_color=AMBER),
                        use_container_width=True)
    with d2:
        st.plotly_chart(array_heatmap(sub, f"Slice  {sub.shape}", colorscale_key="amber",
                                      annotation_fmt=".0f"), use_container_width=True)
    st.code(f"arr[{r_start}:{r_stop}, {c_start}:{c_stop}]", language="python")

elif mode == "Fancy Indexing":
    with st.sidebar:
        sel_rows = st.multiselect("Rows", list(range(rows)), default=[0, 2])
        sel_cols = st.multiselect("Cols", list(range(cols_n)), default=[1, 3, 4])

    if sel_rows and sel_cols:
        sub = arr[np.ix_(sel_rows, sel_cols)]
        hl = [(r, cc) for r in sel_rows for cc in sel_cols]
        d1, d2 = st.columns(2)
        with d1:
            st.plotly_chart(array_heatmap(arr, "Original", annotation_fmt=".0f",
                                          highlight_cells=hl, highlight_color=PURPLE),
                            use_container_width=True)
        with d2:
            st.plotly_chart(array_heatmap(sub, f"Fancy  {sub.shape}", colorscale_key="purple",
                                          annotation_fmt=".0f"), use_container_width=True)
        st.code(f"arr[np.ix_({sel_rows}, {sel_cols})]", language="python")
    else:
        st.info("Select at least one row and one column.")

elif mode == "Boolean Mask":
    with st.sidebar:
        cond = st.selectbox("Condition", ["> threshold", "< threshold", "even", "odd"])
        if cond.endswith("threshold"):
            thresh = st.slider("Threshold", int(arr.min()), int(arr.max()), int(arr.mean()))

    if cond == "> threshold":
        mask = arr > thresh; code = f"arr[arr > {thresh}]"
    elif cond == "< threshold":
        mask = arr < thresh; code = f"arr[arr < {thresh}]"
    elif cond == "even":
        mask = arr % 2 == 0; code = "arr[arr % 2 == 0]"
    else:
        mask = arr % 2 == 1; code = "arr[arr % 2 == 1]"

    hl = [(i, j) for i in range(rows) for j in range(cols_n) if mask[i, j]]
    selected = arr[mask]

    # Animate cells being tested
    anim = Animator("bool_mask", total_steps=int(arr.size), speed=0.2)
    anim.controls()
    step = anim.current
    tested_hl = []
    match_hl = []
    for idx in range(step + 1):
        r, cc = divmod(idx, cols_n)
        if mask[r, cc]:
            match_hl.append((r, cc))
        tested_hl.append((r, cc))

    d1, d2 = st.columns(2)
    with d1:
        st.plotly_chart(array_heatmap(arr, "Testing…", annotation_fmt=".0f",
                                      highlight_cells=match_hl, highlight_color=CORAL),
                        use_container_width=True)
    with d2:
        st.plotly_chart(array_heatmap(mask.astype(float), "Mask (1=True)", colorscale_key="purple",
                                      annotation_fmt=".0f"), use_container_width=True)

    partial_sel = arr[mask][:len(match_hl)] if match_hl else np.array([])
    if partial_sel.size > 0:
        st.plotly_chart(array_heatmap(partial_sel, f"Selected ({len(match_hl)} so far)",
                                      colorscale_key="amber", annotation_fmt=".0f"),
                        use_container_width=True)
    st.code(code, language="python")
    anim.maybe_advance()

elif mode == "Stride Tricks":
    with st.sidebar:
        row_step = st.slider("Row step", 1, max(rows // 2, 2), 2)
        col_step = st.slider("Col step", 1, max(cols_n // 2, 2), 2)
    sub = arr[::row_step, ::col_step]
    hl = [(r, cc) for r in range(0, rows, row_step) for cc in range(0, cols_n, col_step)]
    d1, d2 = st.columns(2)
    with d1:
        st.plotly_chart(array_heatmap(arr, "Original", annotation_fmt=".0f",
                                      highlight_cells=hl, highlight_color=TEAL),
                        use_container_width=True)
    with d2:
        st.plotly_chart(array_heatmap(sub, f"Strided  {sub.shape}", colorscale_key="amber",
                                      annotation_fmt=".0f"), use_container_width=True)
    st.code(f"arr[::{row_step}, ::{col_step}]", language="python")

elif mode == "np.where":
    with st.sidebar:
        thresh = st.slider("Threshold", int(arr.min()), int(arr.max()), int(arr.mean()))
        val_true = st.number_input("Value if True", value=1.0)
        val_false = st.number_input("Value if False", value=0.0)
    mask = arr > thresh
    result = np.where(mask, val_true, val_false)
    hl = [(i, j) for i in range(rows) for j in range(cols_n) if mask[i, j]]
    d1, d2, d3 = st.columns(3)
    with d1:
        st.plotly_chart(array_heatmap(arr, "Input", annotation_fmt=".0f",
                                      highlight_cells=hl, highlight_color=TEAL),
                        use_container_width=True)
    with d2:
        st.plotly_chart(array_heatmap(mask.astype(float), f"arr > {thresh}", colorscale_key="purple",
                                      annotation_fmt=".0f"), use_container_width=True)
    with d3:
        st.plotly_chart(array_heatmap(result, "np.where result", colorscale_key="amber",
                                      annotation_fmt=".0f"), use_container_width=True)
    st.code(f"np.where(arr > {thresh}, {val_true}, {val_false})", language="python")
