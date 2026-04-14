"""
Page 3 – Matrix Operations: matmul step-by-step, determinant, inverse, trace.
"""

import streamlit as st
import numpy as np
from utils.theme import CUSTOM_CSS, TEAL, PURPLE, AMBER, CORAL
from utils.viz import (
    array_heatmap, matmul_step_figure, shape_badge,
    COLORSCALE_TEAL, COLORSCALE_PURPLE, COLORSCALE_AMBER,
)

st.set_page_config(page_title="Matrix Operations", page_icon="✖️", layout="wide")
st.markdown(CUSTOM_CSS, unsafe_allow_html=True)

st.markdown(f'<h2 style="color:{AMBER};">✖️ Matrix Operations</h2>', unsafe_allow_html=True)
st.caption("Step through matrix multiplication and other linear algebra ops cell by cell.")
st.markdown("---")

# ── Sidebar ───────────────────────────────────────────────────
with st.sidebar:
    st.subheader("Operation")
    op = st.radio(
        "Choose",
        ["Matrix Multiply (A @ B)", "Dot Product (vectors)", "Determinant",
         "Inverse", "Trace", "Eigenvalues"],
    )
    st.markdown("---")
    seed = st.number_input("Seed", value=7, step=1)

rng = np.random.default_rng(int(seed))

# ══════════════════════════════════════════════════════════════
if op == "Matrix Multiply (A @ B)":
    with st.sidebar:
        m = st.slider("A rows (m)", 2, 5, 3)
        n = st.slider("Shared dim (n)", 2, 5, 3)
        p = st.slider("B cols (p)", 2, 5, 4)

    A = rng.integers(1, 10, (m, n)).astype(float)
    B = rng.integers(1, 10, (n, p)).astype(float)
    C = A @ B

    # Full result overview
    st.markdown(f"**A** {shape_badge(A.shape)} &nbsp; @ &nbsp; **B** {shape_badge(B.shape)} "
                f"&nbsp; → &nbsp; **C** {shape_badge(C.shape)}", unsafe_allow_html=True)
    st.markdown("")

    c1, c2, c3 = st.columns(3)
    with c1:
        st.plotly_chart(array_heatmap(A, title="A", colorscale=COLORSCALE_TEAL, annotation_fmt=".0f"),
                        use_container_width=True)
    with c2:
        st.plotly_chart(array_heatmap(B, title="B", colorscale=COLORSCALE_PURPLE, annotation_fmt=".0f"),
                        use_container_width=True)
    with c3:
        st.plotly_chart(array_heatmap(C, title="C = A @ B", colorscale=COLORSCALE_AMBER, annotation_fmt=".0f"),
                        use_container_width=True)

    # Step-by-step
    st.markdown("---")
    st.markdown(f"### 🔬 Step-by-step Computation")

    s1, s2 = st.columns(2)
    with s1:
        step_row = st.slider("Result row (i)", 0, m - 1, 0)
    with s2:
        step_col = st.slider("Result col (j)", 0, p - 1, 0)

    fig_a, fig_b, calc_text = matmul_step_figure(A, B, step_row, step_col)

    d1, d2 = st.columns(2)
    with d1:
        st.plotly_chart(fig_a, use_container_width=True)
    with d2:
        st.plotly_chart(fig_b, use_container_width=True)

    st.markdown(
        f'<div style="background:#12121f; border:1px solid {AMBER}; border-radius:10px; '
        f'padding:16px; text-align:center; font-size:1rem; color:{AMBER};">'
        f'C[{step_row},{step_col}] = {calc_text}</div>',
        unsafe_allow_html=True,
    )

    # Highlight result cell
    hl_result = [(step_row, step_col)]
    st.plotly_chart(
        array_heatmap(C, title="Result C (highlighted cell)", colorscale=COLORSCALE_AMBER,
                      highlight_cells=hl_result, highlight_color=AMBER, annotation_fmt=".0f"),
        use_container_width=True,
    )

# ──────────────────────────────────────────────────────────────
elif op == "Dot Product (vectors)":
    with st.sidebar:
        length = st.slider("Vector length", 2, 8, 4)
    a = rng.integers(1, 10, length).astype(float)
    b = rng.integers(1, 10, length).astype(float)
    dot = np.dot(a, b)

    c1, c2 = st.columns(2)
    with c1:
        st.plotly_chart(array_heatmap(a, title="a", annotation_fmt=".0f"), use_container_width=True)
    with c2:
        st.plotly_chart(array_heatmap(b, title="b", colorscale=COLORSCALE_PURPLE, annotation_fmt=".0f"),
                        use_container_width=True)

    pairs = " + ".join([f"{a[i]:.0f}×{b[i]:.0f}" for i in range(length)])
    st.markdown(
        f'<div style="background:#12121f; border:1px solid {TEAL}; border-radius:10px; '
        f'padding:16px; text-align:center; font-size:1rem;">'
        f'<span style="color:{TEAL};">np.dot(a, b)</span> = {pairs} = '
        f'<span style="color:{AMBER}; font-weight:700; font-size:1.3rem;">{dot:.0f}</span></div>',
        unsafe_allow_html=True,
    )

# ──────────────────────────────────────────────────────────────
elif op == "Determinant":
    with st.sidebar:
        n = st.slider("Matrix size (n×n)", 2, 5, 3)
    A = rng.integers(1, 10, (n, n)).astype(float)
    det = np.linalg.det(A)

    st.plotly_chart(array_heatmap(A, title=f"A ({n}×{n})", annotation_fmt=".0f"),
                    use_container_width=True)
    st.markdown(
        f'<div style="background:#12121f; border:1px solid {CORAL}; border-radius:10px; '
        f'padding:16px; text-align:center;">'
        f'<span style="color:#64748b;">np.linalg.det(A)</span> = '
        f'<span style="color:{CORAL}; font-weight:700; font-size:1.5rem;">{det:.4f}</span></div>',
        unsafe_allow_html=True,
    )
    if abs(det) < 1e-10:
        st.warning("⚠️ Determinant ≈ 0 → matrix is singular (non-invertible).")

# ──────────────────────────────────────────────────────────────
elif op == "Inverse":
    with st.sidebar:
        n = st.slider("Matrix size (n×n)", 2, 5, 3)
    A = rng.integers(1, 10, (n, n)).astype(float)
    det = np.linalg.det(A)

    c1, c2 = st.columns(2)
    with c1:
        st.plotly_chart(array_heatmap(A, title="A", annotation_fmt=".1f"), use_container_width=True)
    if abs(det) < 1e-10:
        with c2:
            st.error("Matrix is singular – inverse does not exist.")
    else:
        A_inv = np.linalg.inv(A)
        with c2:
            st.plotly_chart(array_heatmap(A_inv, title="A⁻¹ = np.linalg.inv(A)",
                                          colorscale=COLORSCALE_PURPLE, annotation_fmt=".3f"),
                            use_container_width=True)

        # Verification
        identity = A @ A_inv
        st.markdown("**Verification: A @ A⁻¹ ≈ I**")
        st.plotly_chart(array_heatmap(identity, title="A @ A⁻¹ (should be Identity)",
                                      colorscale=COLORSCALE_AMBER, annotation_fmt=".4f"),
                        use_container_width=True)

# ──────────────────────────────────────────────────────────────
elif op == "Trace":
    with st.sidebar:
        n = st.slider("Matrix size (n×n)", 2, 6, 4)
    A = rng.integers(1, 15, (n, n)).astype(float)
    diag_cells = [(i, i) for i in range(n)]
    trace = np.trace(A)

    st.plotly_chart(
        array_heatmap(A, title="A (diagonal highlighted)", annotation_fmt=".0f",
                      highlight_cells=diag_cells, highlight_color=AMBER),
        use_container_width=True,
    )
    diag_str = " + ".join([f"{A[i, i]:.0f}" for i in range(n)])
    st.markdown(
        f'<div style="background:#12121f; border:1px solid {AMBER}; border-radius:10px; '
        f'padding:16px; text-align:center;">'
        f'<span style="color:#64748b;">np.trace(A)</span> = {diag_str} = '
        f'<span style="color:{AMBER}; font-weight:700; font-size:1.3rem;">{trace:.0f}</span></div>',
        unsafe_allow_html=True,
    )

# ──────────────────────────────────────────────────────────────
elif op == "Eigenvalues":
    with st.sidebar:
        n = st.slider("Matrix size (n×n)", 2, 5, 3)
    A = rng.integers(1, 10, (n, n)).astype(float)
    eigenvalues, eigenvectors = np.linalg.eig(A)

    st.plotly_chart(array_heatmap(A, title="A", annotation_fmt=".0f"), use_container_width=True)
    st.markdown("---")

    st.markdown(f"**Eigenvalues** (`np.linalg.eig(A)`)")
    eig_display = np.atleast_2d(eigenvalues.real)
    st.plotly_chart(array_heatmap(eig_display, title="λ (real parts)",
                                  colorscale=COLORSCALE_AMBER, annotation_fmt=".3f"),
                    use_container_width=True)

    st.markdown("**Eigenvectors** (columns)")
    st.plotly_chart(array_heatmap(eigenvectors.real, title="Eigenvectors V",
                                  colorscale=COLORSCALE_PURPLE, annotation_fmt=".3f"),
                    use_container_width=True)
    st.code("eigenvalues, eigenvectors = np.linalg.eig(A)", language="python")
