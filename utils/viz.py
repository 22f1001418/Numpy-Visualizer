"""
Visualization helpers – theme-aware Plotly heatmaps, annotations, and input widget.
"""

import numpy as np
import pandas as pd
import streamlit as st
import plotly.graph_objects as go
from utils.theme import (
    get_colors, get_colorscales, get_plotly_layout,
    TEAL, PURPLE, AMBER, CORAL, CYAN,
)


# ═══════════════════════════════════════════════════════════════
#  Array Heatmap
# ═══════════════════════════════════════════════════════════════

def array_heatmap(
    arr: np.ndarray,
    title: str = "",
    colorscale_key: str = "teal",
    highlight_cells: list[tuple[int, int]] | None = None,
    highlight_color: str = TEAL,
    annotation_fmt: str = ".2f",
    show_indices: bool = True,
    height: int | None = None,
) -> go.Figure:
    """Render a 2-D array as an annotated heatmap grid."""
    if arr.ndim == 0:
        arr = arr.reshape(1, 1)
    if arr.ndim == 1:
        arr = arr.reshape(1, -1)

    rows, cols = arr.shape
    c = get_colors()
    cs = get_colorscales().get(colorscale_key, get_colorscales()["teal"])

    if height is None:
        height = max(180, rows * 60 + 80)

    fig = go.Figure()
    fig.add_trace(go.Heatmap(
        z=arr[::-1].tolist(),
        colorscale=cs,
        showscale=False,
        xgap=3,
        ygap=3,
        hovertemplate="row %{y} · col %{x}<br>value: %{z}<extra></extra>",
    ))

    # value annotations
    for i in range(rows):
        for j in range(cols):
            val = arr[i, j]
            if np.isnan(val) or np.isinf(val):
                display = str(val)
            else:
                display = f"{val:{annotation_fmt}}" if isinstance(val, (float, np.floating)) else str(int(val))
            is_hl = highlight_cells and (i, j) in highlight_cells
            fig.add_annotation(
                x=j, y=rows - 1 - i,
                text=f"<b>{display}</b>" if is_hl else display,
                showarrow=False,
                font=dict(
                    size=14 if is_hl else 12,
                    color=highlight_color if is_hl else c["annotation_color"],
                    family="JetBrains Mono, monospace",
                ),
            )

    if show_indices:
        fig.update_xaxes(tickvals=list(range(cols)), ticktext=[str(i) for i in range(cols)],
                         side="bottom", tickfont=dict(color=c["text_muted"], size=10),
                         showgrid=False, zeroline=False)
        fig.update_yaxes(tickvals=list(range(rows)),
                         ticktext=[str(r) for r in range(rows - 1, -1, -1)],
                         tickfont=dict(color=c["text_muted"], size=10),
                         showgrid=False, zeroline=False)
    else:
        fig.update_xaxes(showticklabels=False, showgrid=False, zeroline=False)
        fig.update_yaxes(showticklabels=False, showgrid=False, zeroline=False)

    layout = {**get_plotly_layout(), "height": height,
              "title": dict(text=title, font=dict(size=14, color=c["text"]), x=0.5)}
    fig.update_layout(**layout)

    if highlight_cells:
        for (r, cc) in highlight_cells:
            fig.add_shape(type="rect",
                          x0=cc - 0.5, x1=cc + 0.5,
                          y0=(rows - 1 - r) - 0.5, y1=(rows - 1 - r) + 0.5,
                          line=dict(color=highlight_color, width=2.5),
                          fillcolor="rgba(0,0,0,0)")
    return fig


# ═══════════════════════════════════════════════════════════════
#  Matmul step helper
# ═══════════════════════════════════════════════════════════════

def matmul_step_figure(A, B, row_idx, col_idx):
    rows_a, cols_a = A.shape
    rows_b, cols_b = B.shape
    hl_a = [(row_idx, j) for j in range(cols_a)]
    hl_b = [(i, col_idx) for i in range(rows_b)]
    fig_a = array_heatmap(A, title=f"A  row {row_idx}", colorscale_key="teal",
                          highlight_cells=hl_a, highlight_color=TEAL, annotation_fmt=".0f")
    fig_b = array_heatmap(B, title=f"B  col {col_idx}", colorscale_key="purple",
                          highlight_cells=hl_b, highlight_color=PURPLE, annotation_fmt=".0f")
    pairs = [f"{A[row_idx, k]:.0f}×{B[k, col_idx]:.0f}" for k in range(cols_a)]
    dot_val = np.dot(A[row_idx], B[:, col_idx])
    text = " + ".join(pairs) + f" = **{dot_val:.0f}**"
    return fig_a, fig_b, text


# ═══════════════════════════════════════════════════════════════
#  User array input widget
# ═══════════════════════════════════════════════════════════════

def array_input(
    label: str,
    default: np.ndarray,
    key: str,
) -> np.ndarray:
    """
    Render a toggle: Random / Manual.
    In manual mode, show an editable data-frame.
    Returns the final numpy array.
    """
    c = get_colors()
    mode_key = f"{key}_mode"
    if mode_key not in st.session_state:
        st.session_state[mode_key] = "Random"

    col_label, col_toggle = st.columns([2, 1])
    with col_label:
        st.markdown(f"**{label}** &nbsp; `{default.shape}`")
    with col_toggle:
        mode = st.radio("Input", ["Random", "Manual"], key=mode_key,
                        horizontal=True, label_visibility="collapsed")

    if mode == "Manual":
        if default.ndim == 1:
            df = pd.DataFrame(default.reshape(1, -1),
                              columns=[f"c{j}" for j in range(default.shape[0])])
        else:
            df = pd.DataFrame(default,
                              columns=[f"c{j}" for j in range(default.shape[-1])])
        edited = st.data_editor(df, key=f"{key}_editor", use_container_width=True, hide_index=True)
        return edited.to_numpy().astype(float)
    return default


# ═══════════════════════════════════════════════════════════════
#  HTML helpers
# ═══════════════════════════════════════════════════════════════

def shape_badge(shape: tuple) -> str:
    c = get_colors()
    dims = " × ".join(str(s) for s in shape)
    return (
        f'<span style="background:{c["bg_card"]}; border:1px solid {TEAL}; '
        f'border-radius:6px; padding:2px 10px; color:{TEAL}; '
        f'font-family:JetBrains Mono,monospace; font-size:0.85rem;">{dims}</span>'
    )


def big_result(value, label="RESULT", accent=AMBER):
    c = get_colors()
    st.markdown(
        f'<div style="background:{c["bg_card"]}; border:2px solid {accent}; border-radius:16px; '
        f'padding:1.5rem; text-align:center;">'
        f'<div style="color:{c["text_muted"]}; font-size:0.75rem;">{label}</div>'
        f'<div style="color:{accent}; font-size:2.5rem; font-weight:700; '
        f'font-family:JetBrains Mono,monospace;">{value}</div></div>',
        unsafe_allow_html=True,
    )


def formula_bar(text: str, accent=TEAL):
    c = get_colors()
    st.markdown(
        f'<div style="background:{c["bg_card"]}; border:1px solid {accent}; border-radius:10px; '
        f'padding:14px; text-align:center; font-size:0.95rem; color:{c["text"]};">{text}</div>',
        unsafe_allow_html=True,
    )
