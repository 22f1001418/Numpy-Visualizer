"""
Page 6 – Aggregations: animated collapse along axes.
"""

import streamlit as st
import numpy as np
import plotly.graph_objects as go
from utils.theme import page_setup, get_colors, get_plotly_layout, TEAL, PURPLE, AMBER, CORAL
from utils.viz import array_heatmap, shape_badge, array_input, formula_bar, big_result
from utils.animator import Animator

page_setup("Aggregations", "📊")
c = get_colors()

st.markdown(f'<h2 style="color:{TEAL};">📊 Aggregations</h2>', unsafe_allow_html=True)
st.caption("Watch aggregation collapse dimensions — animated along rows, columns, or everything.")
st.markdown("---")

with st.sidebar:
    st.subheader("Controls")
    agg_fn = st.selectbox("Function", ["sum", "mean", "min", "max", "std", "prod"])
    axis_choice = st.radio("Axis", ["axis=0 (↓ rows)", "axis=1 (→ cols)", "axis=None (all)"])
    st.markdown("---")
    rows = st.slider("Rows", 2, 6, 4)
    cols_n = st.slider("Cols", 2, 6, 5)
    seed = st.number_input("Seed", value=11, step=1)

rng = np.random.default_rng(int(seed))
arr_def = rng.integers(1, 20, (rows, cols_n)).astype(float)

with st.expander("✏️ Edit array", expanded=False):
    arr = array_input("Array", arr_def, "agg_arr")
rows, cols_n = arr.shape

axis = {"axis=0 (↓ rows)": 0, "axis=1 (→ cols)": 1, "axis=None (all)": None}[axis_choice]
fn = {"sum": np.sum, "mean": np.mean, "min": np.min,
      "max": np.max, "std": np.std, "prod": np.prod}[agg_fn]
result = fn(arr, axis=axis)

# ── Determine steps based on axis ─────────────────────────────
if axis == 0:
    n_groups = cols_n
    color = PURPLE
    explain = "Collapse **rows** (vertical) → one value per column."
elif axis == 1:
    n_groups = rows
    color = AMBER
    explain = "Collapse **columns** (horizontal) → one value per row."
else:
    n_groups = 1
    color = CORAL
    explain = "Collapse **entire array** → scalar."

st.markdown(f"`np.{agg_fn}(arr, axis={axis})` — {explain}")
st.markdown("")

anim = Animator("agg", total_steps=n_groups, speed=0.6)
anim.controls()
step = anim.current

# Highlight cells for current group
if axis == 0:
    hl = [(r, step) for r in range(rows)]
    vals = arr[:, step]
elif axis == 1:
    hl = [(step, cc) for cc in range(cols_n)]
    vals = arr[step, :]
else:
    hl = [(r, cc) for r in range(rows) for cc in range(cols_n)]
    vals = arr.flatten()

res_val = fn(vals)

d1, d2 = st.columns([3, 2])
with d1:
    st.plotly_chart(array_heatmap(arr, f"Input ({rows}×{cols_n})", annotation_fmt=".0f",
                                  highlight_cells=hl, highlight_color=color),
                    use_container_width=True)
with d2:
    if axis is not None:
        # Build partial result
        partial = np.full(n_groups, np.nan)
        for i in range(step + 1):
            if axis == 0:
                partial[i] = fn(arr[:, i])
            else:
                partial[i] = fn(arr[i, :])
        res_2d = partial.reshape(1, -1) if axis == 0 else partial.reshape(-1, 1)
        st.plotly_chart(array_heatmap(res_2d, f"Result (building…)",
                                      colorscale_key="amber", annotation_fmt=".2f"),
                        use_container_width=True)
    else:
        big_result(f"{result:.4f}", "SCALAR", CORAL)

# Formula for current group
vals_str = ", ".join(f"{v:.0f}" for v in vals)
formula_bar(f"{'col' if axis==0 else 'row' if axis==1 else 'all'}[{step}]: "
            f"np.{agg_fn}([{vals_str}]) = <b>{res_val:.2f}</b>", accent=color)

st.markdown("---")

# ── Bar chart (shown after full animation) ────────────────────
if axis is not None and isinstance(result, np.ndarray) and result.ndim >= 1:
    st.markdown("### 📈 Bar Chart")
    labels = [f"{'col' if axis == 0 else 'row'} {i}" for i in range(len(result))]
    fig = go.Figure()
    fig.add_trace(go.Bar(
        x=labels, y=result, marker_color=color, opacity=0.85,
        text=[f"{v:.2f}" for v in result], textposition="outside",
        textfont=dict(color=c["text"], family="JetBrains Mono, monospace", size=12),
    ))
    layout = {**get_plotly_layout(), "height": 300,
              "title": dict(text=f"{agg_fn}(axis={axis})", font=dict(size=14, color=c["text"]), x=0.5),
              "yaxis": dict(showgrid=True, gridcolor=c["plotly_grid"], zeroline=False),
              "xaxis": dict(showgrid=False)}
    fig.update_layout(**layout)
    st.plotly_chart(fig, use_container_width=True)

with st.expander("🧭 Axis Reference"):
    st.code("""
           axis=1  →
      ┌────────────────┐
axis=0│ (0,0) (0,1) …  │
  ↓   │ (1,0) (1,1) …  │
      └────────────────┘
    """)

anim.maybe_advance()
