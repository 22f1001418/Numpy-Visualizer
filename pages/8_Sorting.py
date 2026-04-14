"""
Page 8 – Sorting: sort, argsort, partition, unique — with step animation.
"""

import streamlit as st
import numpy as np
import plotly.graph_objects as go
from utils.theme import page_setup, get_colors, get_plotly_layout, TEAL, PURPLE, AMBER
from utils.viz import array_heatmap, shape_badge, array_input, formula_bar, big_result
from utils.animator import Animator

page_setup("Sorting", "🔃")
c = get_colors()

st.markdown(f'<h2 style="color:{AMBER};">🔃 Sorting</h2>', unsafe_allow_html=True)
st.caption("Watch elements rearrange — sort, argsort, partition, and unique.")
st.markdown("---")

with st.sidebar:
    st.subheader("Operation")
    op = st.radio("Choose", ["sort (1D)", "sort (2D axis)", "argsort", "partition", "unique"])
    st.markdown("---")
    seed = st.number_input("Seed", value=21, step=1)

rng = np.random.default_rng(int(seed))

# ══════════════════════════════════════════════════════════════
if op == "sort (1D)":
    with st.sidebar:
        n = st.slider("Elements", 4, 16, 8)
    arr = rng.integers(1, 50, n).astype(float)
    with st.expander("✏️ Edit", expanded=False):
        arr = array_input("Array", arr, "s1d").flatten()

    sorted_arr = np.sort(arr)
    # Animate progressive reveal of sorted array
    anim = Animator("sort1d", total_steps=len(arr), speed=0.4)
    anim.controls()

    # Bar chart: original vs sorted
    step = anim.current
    fig = go.Figure()
    fig.add_trace(go.Bar(
        x=[f"[{i}]" for i in range(len(arr))], y=arr, name="Original",
        marker_color=c["text_dim"], opacity=0.4,
    ))
    sorted_partial = list(sorted_arr[:step + 1]) + [0] * (len(arr) - step - 1)
    colors = [TEAL if i <= step else "transparent" for i in range(len(arr))]
    fig.add_trace(go.Bar(
        x=[f"[{i}]" for i in range(len(arr))], y=sorted_partial, name="Sorted (so far)",
        marker_color=colors,
    ))
    layout = {**get_plotly_layout(), "height": 350, "barmode": "overlay",
              "title": dict(text="Sort progress", font=dict(size=14, color=c["text"]), x=0.5),
              "yaxis": dict(showgrid=True, gridcolor=c["plotly_grid"]),
              "legend": dict(font=dict(color=c["text"]))}
    fig.update_layout(**layout)
    st.plotly_chart(fig, use_container_width=True)

    d1, d2 = st.columns(2)
    with d1:
        st.plotly_chart(array_heatmap(arr, "Original", annotation_fmt=".0f"), use_container_width=True)
    with d2:
        partial = np.full_like(sorted_arr, np.nan)
        partial[:step + 1] = sorted_arr[:step + 1]
        st.plotly_chart(array_heatmap(partial, "Sorted", colorscale_key="amber",
                                      annotation_fmt=".0f"), use_container_width=True)
    st.code("np.sort(arr)", language="python")
    anim.maybe_advance()

elif op == "sort (2D axis)":
    with st.sidebar:
        rows = st.slider("Rows", 2, 6, 3)
        cols_n = st.slider("Cols", 2, 6, 5)
        axis = st.radio("Sort axis", [0, 1])
    arr = rng.integers(1, 30, (rows, cols_n)).astype(float)
    with st.expander("✏️ Edit", expanded=False):
        arr = array_input("Array", arr, "s2d")
    sorted_arr = np.sort(arr, axis=axis)

    d1, d2 = st.columns(2)
    with d1:
        st.plotly_chart(array_heatmap(arr, f"Original  {arr.shape}", annotation_fmt=".0f"),
                        use_container_width=True)
    with d2:
        st.plotly_chart(array_heatmap(sorted_arr, f"Sorted (axis={axis})", colorscale_key="amber",
                                      annotation_fmt=".0f"), use_container_width=True)
    st.code(f"np.sort(arr, axis={axis})", language="python")

elif op == "argsort":
    with st.sidebar:
        n = st.slider("Elements", 4, 12, 6)
    arr = rng.integers(1, 50, n).astype(float)
    with st.expander("✏️ Edit", expanded=False):
        arr = array_input("Array", arr, "as_arr").flatten()

    indices = np.argsort(arr)
    anim = Animator("argsort", total_steps=len(arr), speed=0.5)
    anim.controls()
    step = anim.current

    hl_orig = [(0, int(indices[step]))]
    hl_idx = [(0, step)]

    d1, d2, d3 = st.columns(3)
    with d1:
        st.plotly_chart(array_heatmap(arr, "Original", annotation_fmt=".0f",
                                      highlight_cells=hl_orig, highlight_color=TEAL),
                        use_container_width=True)
    with d2:
        partial_idx = np.full(len(arr), np.nan)
        partial_idx[:step + 1] = indices[:step + 1]
        st.plotly_chart(array_heatmap(partial_idx, "argsort indices", colorscale_key="purple",
                                      annotation_fmt=".0f", highlight_cells=hl_idx,
                                      highlight_color=PURPLE),
                        use_container_width=True)
    with d3:
        partial_sorted = np.full(len(arr), np.nan)
        for i in range(step + 1):
            partial_sorted[i] = arr[int(indices[i])]
        st.plotly_chart(array_heatmap(partial_sorted, "arr[argsort]", colorscale_key="amber",
                                      annotation_fmt=".0f"), use_container_width=True)

    formula_bar(f"Position {step}: index={int(indices[step])} → value={arr[int(indices[step])]:.0f}",
                accent=PURPLE)
    st.code("indices = np.argsort(arr)\narr[indices]  # sorted", language="python")
    anim.maybe_advance()

elif op == "partition":
    with st.sidebar:
        n = st.slider("Elements", 6, 16, 10)
        kth = st.slider("kth", 0, n - 1, n // 3)
    arr = rng.integers(1, 50, n).astype(float)
    with st.expander("✏️ Edit", expanded=False):
        arr = array_input("Array", arr, "part_arr").flatten()

    result = np.partition(arr, kth)
    hl_left = [(0, i) for i in range(kth)]
    hl_pivot = [(0, kth)]
    hl_right = [(0, i) for i in range(kth + 1, len(arr))]

    d1, d2 = st.columns(2)
    with d1:
        st.plotly_chart(array_heatmap(arr, "Original", annotation_fmt=".0f"), use_container_width=True)
    with d2:
        st.plotly_chart(array_heatmap(result, f"Partitioned (kth={kth})", colorscale_key="amber",
                                      annotation_fmt=".0f",
                                      highlight_cells=hl_pivot, highlight_color=AMBER),
                        use_container_width=True)
    formula_bar(
        f"Element at position <b>{kth}</b> = {result[kth]:.0f}. "
        f"All values left ≤ {result[kth]:.0f}, all values right ≥ {result[kth]:.0f}.",
        accent=AMBER)
    st.code(f"np.partition(arr, {kth})", language="python")

elif op == "unique":
    with st.sidebar:
        n = st.slider("Elements", 6, 20, 12)
    arr = rng.integers(1, 10, n).astype(float)
    with st.expander("✏️ Edit", expanded=False):
        arr = array_input("Array", arr, "uniq_arr").flatten()

    uniq, counts = np.unique(arr, return_counts=True)
    d1, d2 = st.columns(2)
    with d1:
        st.plotly_chart(array_heatmap(arr, f"Original ({len(arr)} elements)", annotation_fmt=".0f"),
                        use_container_width=True)
    with d2:
        st.plotly_chart(array_heatmap(uniq, f"Unique ({len(uniq)} values)", colorscale_key="amber",
                                      annotation_fmt=".0f"), use_container_width=True)

    # Counts bar
    fig = go.Figure()
    fig.add_trace(go.Bar(x=[str(v) for v in uniq], y=counts, marker_color=TEAL,
                         text=[str(int(ct)) for ct in counts], textposition="outside",
                         textfont=dict(color=c["text"])))
    layout = {**get_plotly_layout(), "height": 280,
              "title": dict(text="Value counts", font=dict(size=14, color=c["text"]), x=0.5),
              "yaxis": dict(showgrid=True, gridcolor=c["plotly_grid"]),
              "xaxis": dict(title="Value")}
    fig.update_layout(**layout)
    st.plotly_chart(fig, use_container_width=True)
    st.code("uniq, counts = np.unique(arr, return_counts=True)", language="python")
