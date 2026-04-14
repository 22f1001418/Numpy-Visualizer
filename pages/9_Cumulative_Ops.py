"""
Page 9 – Cumulative Ops: cumsum, cumprod, diff – animated running totals.
"""

import streamlit as st
import numpy as np
import plotly.graph_objects as go
from utils.theme import page_setup, get_colors, get_plotly_layout, TEAL, PURPLE, AMBER, CORAL
from utils.viz import array_heatmap, shape_badge, array_input, formula_bar
from utils.animator import Animator

page_setup("Cumulative Ops", "📈")
c = get_colors()

st.markdown(f'<h2 style="color:{CORAL};">📈 Cumulative Operations</h2>', unsafe_allow_html=True)
st.caption("Watch running totals build cell by cell — cumsum, cumprod, diff, and more.")
st.markdown("---")

with st.sidebar:
    st.subheader("Operation")
    op = st.radio("Choose", ["cumsum (1D)", "cumsum (2D axis)", "cumprod", "diff",
                              "percentile / quantile"])
    st.markdown("---")
    seed = st.number_input("Seed", value=15, step=1)

rng = np.random.default_rng(int(seed))

# ══════════════════════════════════════════════════════════════
if op == "cumsum (1D)":
    with st.sidebar:
        n = st.slider("Elements", 4, 14, 8)
    arr = rng.integers(1, 15, n).astype(float)
    with st.expander("✏️ Edit", expanded=False):
        arr = array_input("Array", arr, "cs1d").flatten()
    cs = np.cumsum(arr)

    anim = Animator("cs1d", total_steps=len(arr), speed=0.45)
    anim.controls()
    step = anim.current

    # Heatmaps
    hl = [(0, step)]
    d1, d2 = st.columns(2)
    with d1:
        st.plotly_chart(array_heatmap(arr, "Input", annotation_fmt=".0f",
                                      highlight_cells=hl, highlight_color=TEAL),
                        use_container_width=True)
    with d2:
        partial = np.full_like(cs, np.nan)
        partial[:step + 1] = cs[:step + 1]
        st.plotly_chart(array_heatmap(partial, "cumsum", colorscale_key="amber",
                                      annotation_fmt=".0f",
                                      highlight_cells=hl, highlight_color=AMBER),
                        use_container_width=True)

    # Line chart showing growth
    fig = go.Figure()
    fig.add_trace(go.Scatter(
        x=list(range(step + 1)), y=cs[:step + 1].tolist(),
        mode="lines+markers", line=dict(color=TEAL, width=2),
        marker=dict(size=8, color=TEAL),
        fill="tozeroy", fillcolor="rgba(0,212,170,0.1)",
    ))
    fig.add_trace(go.Scatter(
        x=list(range(len(arr))), y=arr.tolist(),
        mode="lines+markers", line=dict(color=AMBER, width=1, dash="dot"),
        marker=dict(size=5, color=AMBER), name="original",
    ))
    layout = {**get_plotly_layout(), "height": 280, "showlegend": False,
              "yaxis": dict(showgrid=True, gridcolor=c["plotly_grid"]),
              "xaxis": dict(title="index")}
    fig.update_layout(**layout)
    st.plotly_chart(fig, use_container_width=True)

    vals = " + ".join(f"{arr[i]:.0f}" for i in range(step + 1))
    formula_bar(f"cumsum[{step}] = {vals} = <b>{cs[step]:.0f}</b>", accent=TEAL)
    st.code("np.cumsum(arr)", language="python")
    anim.maybe_advance()

elif op == "cumsum (2D axis)":
    with st.sidebar:
        rows = st.slider("Rows", 2, 5, 3)
        cols_n = st.slider("Cols", 2, 6, 4)
        axis = st.radio("Axis", [0, 1])
    arr = rng.integers(1, 10, (rows, cols_n)).astype(float)
    with st.expander("✏️ Edit", expanded=False):
        arr = array_input("Array", arr, "cs2d")
    cs = np.cumsum(arr, axis=axis)
    d1, d2 = st.columns(2)
    with d1:
        st.plotly_chart(array_heatmap(arr, f"Input {arr.shape}", annotation_fmt=".0f"),
                        use_container_width=True)
    with d2:
        st.plotly_chart(array_heatmap(cs, f"cumsum(axis={axis})", colorscale_key="amber",
                                      annotation_fmt=".0f"), use_container_width=True)
    st.code(f"np.cumsum(arr, axis={axis})", language="python")

elif op == "cumprod":
    with st.sidebar:
        n = st.slider("Elements", 4, 10, 6)
    arr = rng.integers(1, 5, n).astype(float)
    with st.expander("✏️ Edit", expanded=False):
        arr = array_input("Array", arr, "cprod").flatten()
    cp = np.cumprod(arr)

    anim = Animator("cprod", total_steps=len(arr), speed=0.5)
    anim.controls()
    step = anim.current

    d1, d2 = st.columns(2)
    with d1:
        st.plotly_chart(array_heatmap(arr, "Input", annotation_fmt=".0f",
                                      highlight_cells=[(0, step)], highlight_color=TEAL),
                        use_container_width=True)
    with d2:
        partial = np.full_like(cp, np.nan)
        partial[:step + 1] = cp[:step + 1]
        st.plotly_chart(array_heatmap(partial, "cumprod", colorscale_key="amber",
                                      annotation_fmt=".0f",
                                      highlight_cells=[(0, step)], highlight_color=AMBER),
                        use_container_width=True)
    vals = " × ".join(f"{arr[i]:.0f}" for i in range(step + 1))
    formula_bar(f"cumprod[{step}] = {vals} = <b>{cp[step]:.0f}</b>", accent=AMBER)
    st.code("np.cumprod(arr)", language="python")
    anim.maybe_advance()

elif op == "diff":
    with st.sidebar:
        n = st.slider("Elements", 5, 14, 8)
        n_diff = st.slider("n (order of diff)", 1, 3, 1)
    arr = rng.integers(1, 20, n).astype(float)
    with st.expander("✏️ Edit", expanded=False):
        arr = array_input("Array", arr, "diff_arr").flatten()
    diff = np.diff(arr, n=n_diff)

    anim = Animator("diff", total_steps=len(diff), speed=0.4)
    anim.controls()
    step = anim.current

    hl_src = [(0, step), (0, step + n_diff)]
    d1, d2 = st.columns(2)
    with d1:
        st.plotly_chart(array_heatmap(arr, "Input", annotation_fmt=".0f",
                                      highlight_cells=hl_src, highlight_color=TEAL),
                        use_container_width=True)
    with d2:
        partial = np.full_like(diff, np.nan)
        partial[:step + 1] = diff[:step + 1]
        st.plotly_chart(array_heatmap(partial, f"diff(n={n_diff})", colorscale_key="purple",
                                      annotation_fmt=".0f"), use_container_width=True)

    if n_diff == 1:
        formula_bar(f"diff[{step}] = arr[{step+1}] − arr[{step}] = "
                    f"{arr[step+1]:.0f} − {arr[step]:.0f} = <b>{diff[step]:.0f}</b>", accent=PURPLE)
    st.code(f"np.diff(arr, n={n_diff})", language="python")
    anim.maybe_advance()

elif op == "percentile / quantile":
    with st.sidebar:
        n = st.slider("Elements", 8, 30, 15)
        q = st.slider("Percentile", 0, 100, 50)
    arr = rng.integers(1, 50, n).astype(float)
    with st.expander("✏️ Edit", expanded=False):
        arr = array_input("Array", arr, "pctile").flatten()
    pval = np.percentile(arr, q)
    sorted_arr = np.sort(arr)

    # Bar chart showing sorted values + threshold line
    fig = go.Figure()
    colors = [TEAL if v <= pval else c["text_dim"] for v in sorted_arr]
    fig.add_trace(go.Bar(x=list(range(len(sorted_arr))), y=sorted_arr, marker_color=colors))
    fig.add_hline(y=pval, line_dash="dash", line_color=CORAL, line_width=2,
                  annotation_text=f"P{q} = {pval:.1f}",
                  annotation_font=dict(color=CORAL, size=14))
    layout = {**get_plotly_layout(), "height": 320,
              "title": dict(text=f"Sorted values — P{q} = {pval:.1f}",
                            font=dict(size=14, color=c["text"]), x=0.5),
              "yaxis": dict(showgrid=True, gridcolor=c["plotly_grid"]),
              "xaxis": dict(title="Rank")}
    fig.update_layout(**layout)
    st.plotly_chart(fig, use_container_width=True)
    st.code(f"np.percentile(arr, {q})  # = {pval:.2f}", language="python")
