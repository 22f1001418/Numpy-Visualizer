"""
Visualization helpers – Plotly heatmap grids, annotations, step highlights.
"""

import numpy as np
import plotly.graph_objects as go
from utils.theme import (
    PLOTLY_LAYOUT, BG_SURFACE, BG_ELEVATED, TEXT_PRIMARY, TEXT_MUTED,
    TEAL, PURPLE, AMBER, CORAL, CYAN, BLUE,
    COLORSCALE_TEAL, COLORSCALE_PURPLE, COLORSCALE_AMBER, COLORSCALE_DIVERGING,
)


def array_heatmap(
    arr: np.ndarray,
    title: str = "",
    colorscale=None,
    highlight_cells: list[tuple[int, int]] | None = None,
    highlight_color: str = TEAL,
    annotation_fmt: str = ".2f",
    show_indices: bool = True,
    height: int | None = None,
) -> go.Figure:
    """Render a 2D array as an annotated heatmap grid."""
    if arr.ndim == 1:
        arr = arr.reshape(1, -1)

    rows, cols = arr.shape
    if colorscale is None:
        colorscale = COLORSCALE_TEAL

    # Auto height
    if height is None:
        height = max(180, rows * 60 + 80)

    fig = go.Figure()

    fig.add_trace(go.Heatmap(
        z=arr[::-1],
        colorscale=colorscale,
        showscale=False,
        xgap=3,
        ygap=3,
        hovertemplate="row %{y}, col %{x}<br>value: %{z}<extra></extra>",
    ))

    # Value annotations
    for i in range(rows):
        for j in range(cols):
            val = arr[i, j]
            display = f"{val:{annotation_fmt}}" if isinstance(val, float) else str(val)
            # Check if this cell is highlighted
            is_highlighted = highlight_cells and (i, j) in highlight_cells
            fig.add_annotation(
                x=j, y=rows - 1 - i,
                text=f"<b>{display}</b>" if is_highlighted else display,
                showarrow=False,
                font=dict(
                    size=14 if is_highlighted else 12,
                    color=highlight_color if is_highlighted else TEXT_PRIMARY,
                    family="JetBrains Mono, monospace",
                ),
            )

    # Axis labels
    if show_indices:
        fig.update_xaxes(
            tickvals=list(range(cols)),
            ticktext=[str(c) for c in range(cols)],
            side="bottom",
            tickfont=dict(color=TEXT_MUTED, size=10),
            showgrid=False,
            zeroline=False,
        )
        fig.update_yaxes(
            tickvals=list(range(rows)),
            ticktext=[str(r) for r in range(rows - 1, -1, -1)],
            tickfont=dict(color=TEXT_MUTED, size=10),
            showgrid=False,
            zeroline=False,
        )
    else:
        fig.update_xaxes(showticklabels=False, showgrid=False, zeroline=False)
        fig.update_yaxes(showticklabels=False, showgrid=False, zeroline=False)

    layout = {**PLOTLY_LAYOUT}
    layout["height"] = height
    layout["title"] = dict(text=title, font=dict(size=14, color=TEXT_PRIMARY), x=0.5)
    fig.update_layout(**layout)

    # Highlight border overlay
    if highlight_cells:
        for (r, c) in highlight_cells:
            fig.add_shape(
                type="rect",
                x0=c - 0.5, x1=c + 0.5,
                y0=(rows - 1 - r) - 0.5, y1=(rows - 1 - r) + 0.5,
                line=dict(color=highlight_color, width=2.5),
                fillcolor="rgba(0,0,0,0)",
            )

    return fig


def side_by_side_arrays(
    a: np.ndarray,
    b: np.ndarray,
    result: np.ndarray,
    op_symbol: str = "+",
    titles: tuple[str, str, str] = ("A", "B", "Result"),
    colorscales: tuple | None = None,
    annotation_fmt: str = ".2f",
) -> tuple[go.Figure, go.Figure, go.Figure]:
    """Return three figures for operand-A, operand-B, and result."""
    cs = colorscales or (COLORSCALE_TEAL, COLORSCALE_PURPLE, COLORSCALE_AMBER)
    figs = []
    for arr, title, cscale in zip([a, b, result], titles, cs):
        figs.append(array_heatmap(arr, title=title, colorscale=cscale, annotation_fmt=annotation_fmt))
    return tuple(figs)


def matmul_step_figure(
    A: np.ndarray,
    B: np.ndarray,
    row_idx: int,
    col_idx: int,
) -> tuple[go.Figure, go.Figure, str]:
    """
    Highlight the active row in A and column in B for a matmul step.
    Returns (fig_a, fig_b, computation_text).
    """
    rows_a, cols_a = A.shape
    rows_b, cols_b = B.shape

    # Highlight entire row in A
    hl_a = [(row_idx, j) for j in range(cols_a)]
    # Highlight entire column in B
    hl_b = [(i, col_idx) for i in range(rows_b)]

    fig_a = array_heatmap(A, title=f"A  (row {row_idx})", colorscale=COLORSCALE_TEAL,
                          highlight_cells=hl_a, highlight_color=TEAL)
    fig_b = array_heatmap(B, title=f"B  (col {col_idx})", colorscale=COLORSCALE_PURPLE,
                          highlight_cells=hl_b, highlight_color=PURPLE)

    # Computation breakdown
    pairs = [f"{A[row_idx, k]:.1f}×{B[k, col_idx]:.1f}" for k in range(cols_a)]
    dot_val = np.dot(A[row_idx], B[:, col_idx])
    text = " + ".join(pairs) + f" = **{dot_val:.2f}**"

    return fig_a, fig_b, text


def broadcast_visualisation(
    a: np.ndarray,
    b: np.ndarray,
) -> tuple[go.Figure, go.Figure, go.Figure, go.Figure]:
    """
    Show original shapes, broadcast-expanded shapes, and result.
    Returns (fig_a_orig, fig_b_orig, fig_a_broadcast, fig_b_broadcast).
    """
    result = a + b
    # Broadcast expand
    a_bc, b_bc = np.broadcast_arrays(a, b)

    fig_a = array_heatmap(a, title=f"A  shape={a.shape}", colorscale=COLORSCALE_TEAL)
    fig_b = array_heatmap(b, title=f"B  shape={b.shape}", colorscale=COLORSCALE_PURPLE)
    fig_a_exp = array_heatmap(a_bc, title=f"A broadcast → {a_bc.shape}", colorscale=COLORSCALE_TEAL)
    fig_b_exp = array_heatmap(b_bc, title=f"B broadcast → {b_bc.shape}", colorscale=COLORSCALE_PURPLE)

    return fig_a, fig_b, fig_a_exp, fig_b_exp


def slice_highlight(
    arr: np.ndarray,
    row_slice: slice,
    col_slice: slice,
) -> tuple[go.Figure, go.Figure]:
    """Highlight sliced region in original array and show extracted sub-array."""
    if arr.ndim == 1:
        arr = arr.reshape(1, -1)
    rows, cols = arr.shape

    r_indices = range(*row_slice.indices(rows))
    c_indices = range(*col_slice.indices(cols))
    hl = [(r, c) for r in r_indices for c in c_indices]

    fig_orig = array_heatmap(arr, title="Original Array", colorscale=COLORSCALE_TEAL,
                             highlight_cells=hl, highlight_color=AMBER)

    sub = arr[row_slice, col_slice]
    fig_sub = array_heatmap(sub, title="Sliced Result", colorscale=COLORSCALE_AMBER)

    return fig_orig, fig_sub


def aggregation_figure(
    arr: np.ndarray,
    axis: int | None,
    op: str = "sum",
) -> tuple[go.Figure, go.Figure]:
    """Show array and the aggregation result along an axis."""
    func_map = {
        "sum": np.sum, "mean": np.mean, "min": np.min,
        "max": np.max, "std": np.std, "prod": np.prod,
    }
    fn = func_map.get(op, np.sum)
    result = fn(arr, axis=axis)

    # Highlight the axis being collapsed
    rows, cols = arr.shape
    if axis == 0:
        hl = [(r, c) for r in range(rows) for c in range(cols)]  # all – collapsed vertically
    elif axis == 1:
        hl = [(r, c) for r in range(rows) for c in range(cols)]
    else:
        hl = None

    fig_arr = array_heatmap(arr, title=f"Input  shape={arr.shape}", colorscale=COLORSCALE_TEAL,
                            highlight_cells=hl, highlight_color=TEAL)

    res = np.atleast_2d(result) if result.ndim < 2 else result
    axis_label = "None (全)" if axis is None else str(axis)
    fig_res = array_heatmap(res, title=f"{op}(axis={axis_label})  →  shape={result.shape}",
                            colorscale=COLORSCALE_AMBER)

    return fig_arr, fig_res


def shape_badge(shape: tuple) -> str:
    """Return an HTML badge showing the shape."""
    dims = " × ".join(str(s) for s in shape)
    return (
        f'<span style="background:#1a1a2e; border:1px solid #00d4aa; '
        f'border-radius:6px; padding:2px 10px; color:#00d4aa; '
        f'font-family:JetBrains Mono,monospace; font-size:0.85rem;">'
        f'{dims}</span>'
    )


def code_block(code: str) -> str:
    """Return styled code block HTML."""
    return (
        f'<div style="background:#12121f; border:1px solid #1a1a2e; '
        f'border-radius:8px; padding:12px 16px; margin:8px 0; '
        f'font-family:JetBrains Mono,monospace; font-size:0.85rem; color:#00d4aa;">'
        f'<code>{code}</code></div>'
    )
