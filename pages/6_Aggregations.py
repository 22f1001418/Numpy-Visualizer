"""
Page 6 – Aggregations: sum, mean, min, max, std, prod along axes.
"""

import streamlit as st
import numpy as np
import plotly.graph_objects as go
from utils.theme import CUSTOM_CSS, TEAL, PURPLE, AMBER, CYAN, CORAL, LIME
from utils.viz import (
    array_heatmap, shape_badge,
    COLORSCALE_TEAL, COLORSCALE_PURPLE, COLORSCALE_AMBER,
    PLOTLY_LAYOUT, BG_SURFACE, TEXT_PRIMARY,
)

st.set_page_config(page_title="Aggregations", page_icon="📊", layout="wide")
st.markdown(CUSTOM_CSS, unsafe_allow_html=True)

st.markdown(f'<h2 style="color:{TEAL};">📊 Aggregations</h2>', unsafe_allow_html=True)
st.caption("See how aggregation collapses dimensions — along rows, columns, or the entire array.")
st.markdown("---")

# ── Sidebar ───────────────────────────────────────────────────
with st.sidebar:
    st.subheader("Controls")
    agg_fn = st.selectbox("Function", ["sum", "mean", "min", "max", "std", "prod"])
    axis_choice = st.radio("Axis", ["axis=0 (collapse rows)", "axis=1 (collapse cols)", "axis=None (all)"])
    st.markdown("---")
    rows = st.slider("Rows", 2, 6, 4)
    cols_n = st.slider("Cols", 2, 6, 5)
    seed = st.number_input("Seed", value=11, step=1)

rng = np.random.default_rng(int(seed))
arr = rng.integers(1, 20, (rows, cols_n)).astype(float)

axis = {"axis=0 (collapse rows)": 0, "axis=1 (collapse cols)": 1, "axis=None (all)": None}[axis_choice]

func_map = {
    "sum": np.sum, "mean": np.mean, "min": np.min,
    "max": np.max, "std": np.std, "prod": np.prod,
}
result = func_map[agg_fn](arr, axis=axis)

# ── Explanation ───────────────────────────────────────────────
if axis == 0:
    explain = "Collapses **rows** (vertical direction). One value per column remains."
    direction = "↓"
    color = PURPLE
elif axis == 1:
    explain = "Collapses **columns** (horizontal direction). One value per row remains."
    direction = "→"
    color = AMBER
else:
    explain = "Collapses the **entire array** into a single scalar."
    direction = "↓→"
    color = CORAL

st.markdown(f"**`np.{agg_fn}(arr, axis={axis})`** — {explain}")
st.markdown("")

# ── Highlight which cells are collapsed ───────────────────────
if axis == 0:
    # Show column-by-column highlights
    step_col = st.slider("Inspect column", 0, cols_n - 1, 0)
    hl = [(r, step_col) for r in range(rows)]
    vals = arr[:, step_col]
    res_val = func_map[agg_fn](vals)
    formula = f"np.{agg_fn}([{', '.join(f'{v:.0f}' for v in vals)}]) = **{res_val:.2f}**"

elif axis == 1:
    step_row = st.slider("Inspect row", 0, rows - 1, 0)
    hl = [(step_row, c) for c in range(cols_n)]
    vals = arr[step_row, :]
    res_val = func_map[agg_fn](vals)
    formula = f"np.{agg_fn}([{', '.join(f'{v:.0f}' for v in vals)}]) = **{res_val:.2f}**"

else:
    hl = [(r, c) for r in range(rows) for c in range(cols_n)]
    res_val = result
    formula = f"np.{agg_fn}(all {rows * cols_n} elements) = **{res_val:.2f}**"

# ── Plots ─────────────────────────────────────────────────────
c1, c2 = st.columns([3, 2])

with c1:
    st.plotly_chart(
        array_heatmap(arr, title=f"Input ({rows}×{cols_n})", annotation_fmt=".0f",
                      highlight_cells=hl, highlight_color=color),
        use_container_width=True,
    )

with c2:
    if axis is not None:
        res_arr = np.atleast_2d(result) if result.ndim == 1 else result
        if axis == 1:
            res_arr = result.reshape(-1, 1)
        st.plotly_chart(
            array_heatmap(res_arr, title=f"Result  {result.shape}",
                          colorscale=COLORSCALE_AMBER, annotation_fmt=".2f"),
            use_container_width=True,
        )
    else:
        # Scalar result – big number display
        st.markdown(
            f'<div style="background:#12121f; border:2px solid {CORAL}; border-radius:16px; '
            f'padding:2rem; text-align:center; margin-top:2rem;">'
            f'<div style="color:#64748b; font-size:0.8rem;">SCALAR RESULT</div>'
            f'<div style="color:{CORAL}; font-size:3rem; font-weight:700; '
            f'font-family:JetBrains Mono,monospace;">{result:.4f}</div>'
            f'</div>',
            unsafe_allow_html=True,
        )

# ── Formula bar ───────────────────────────────────────────────
st.markdown(
    f'<div style="background:#12121f; border:1px solid {color}; border-radius:10px; '
    f'padding:14px; text-align:center; margin-top:0.5rem; font-size:0.95rem;">'
    f'{formula}</div>',
    unsafe_allow_html=True,
)

st.markdown("---")

# ── Axis direction diagram ────────────────────────────────────
with st.expander("🧭 Axis Direction Reference"):
    st.markdown("""
```
               axis=1  →
          ┌──────────────────┐
  axis=0  │  (0,0)  (0,1) … │
    ↓     │  (1,0)  (1,1) … │
          │   …      …    … │
          └──────────────────┘
```

- **axis=0** collapses vertically (across rows) → result has shape `(cols,)`
- **axis=1** collapses horizontally (across cols) → result has shape `(rows,)`
- **axis=None** collapses everything → scalar
    """)

# ── Bar chart of aggregation ─────────────────────────────────
if axis is not None and result.ndim >= 1:
    st.markdown("### 📈 Bar Chart View")
    labels = [f"{'col' if axis == 0 else 'row'} {i}" for i in range(len(result))]
    fig = go.Figure()
    fig.add_trace(go.Bar(
        x=labels, y=result,
        marker_color=color,
        marker_line_color=color,
        marker_line_width=1,
        opacity=0.85,
        text=[f"{v:.2f}" for v in result],
        textposition="outside",
        textfont=dict(color=TEXT_PRIMARY, family="JetBrains Mono, monospace", size=12),
    ))
    layout = {**PLOTLY_LAYOUT}
    layout["height"] = 300
    layout["title"] = dict(text=f"{agg_fn}(axis={axis})", font=dict(size=14, color=TEXT_PRIMARY), x=0.5)
    layout["yaxis"] = dict(showgrid=True, gridcolor="#1a1a2e", zeroline=False)
    layout["xaxis"] = dict(showgrid=False)
    fig.update_layout(**layout)
    st.plotly_chart(fig, use_container_width=True)
