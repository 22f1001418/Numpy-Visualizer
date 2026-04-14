"""
Page 3 – Matrix Operations: animated matmul, dot, det, inv, trace, eigen, rank.
"""

import streamlit as st
import numpy as np
from utils.theme import page_setup, get_colors, TEAL, PURPLE, AMBER, CORAL
from utils.viz import array_heatmap, matmul_step_figure, shape_badge, array_input, big_result, formula_bar
from utils.animator import Animator

page_setup("Matrix Operations", "✖️")
c = get_colors()

st.markdown(f'<h2 style="color:{AMBER};">✖️ Matrix Operations</h2>', unsafe_allow_html=True)
st.caption("Step through matrix multiplication cell by cell and explore linear algebra operations.")
st.markdown("---")

with st.sidebar:
    st.subheader("Operation")
    op = st.radio("Choose", [
        "Matrix Multiply (A @ B)", "Dot Product (vectors)",
        "Determinant", "Inverse", "Trace", "Eigenvalues", "Matrix Rank",
    ])
    st.markdown("---")
    seed = st.number_input("Seed", value=7, step=1)

rng = np.random.default_rng(int(seed))

# ══════════════════════════════════════════════════════════════
if op == "Matrix Multiply (A @ B)":
    with st.sidebar:
        m = st.slider("A rows (m)", 2, 5, 3)
        n = st.slider("Shared dim (n)", 2, 5, 3)
        p = st.slider("B cols (p)", 2, 5, 4)

    A_def = rng.integers(1, 10, (m, n)).astype(float)
    B_def = rng.integers(1, 10, (n, p)).astype(float)

    with st.expander("✏️ Edit matrices", expanded=False):
        ec1, ec2 = st.columns(2)
        with ec1:
            A = array_input("A", A_def, "mm_a")
        with ec2:
            B = array_input("B", B_def, "mm_b")

    C = A @ B
    total_steps = m * p

    st.markdown(f"**A** {shape_badge(A.shape)} @ **B** {shape_badge(B.shape)} → "
                f"**C** {shape_badge(C.shape)}", unsafe_allow_html=True)

    # Animated step-by-step
    st.markdown("### 🎬 Step-by-step Matmul")
    anim = Animator("matmul", total_steps=total_steps, speed=0.7)
    anim.controls()

    step = anim.current
    si, sj = divmod(step, p)

    fig_a, fig_b, calc = matmul_step_figure(A, B, si, sj)
    d1, d2 = st.columns(2)
    with d1:
        st.plotly_chart(fig_a, use_container_width=True)
    with d2:
        st.plotly_chart(fig_b, use_container_width=True)

    formula_bar(f"C[{si},{sj}] = {calc}", accent=AMBER)

    # Partial result matrix
    partial = np.full((m, p), np.nan)
    for idx in range(step + 1):
        ri, ci = divmod(idx, p)
        partial[ri, ci] = C[ri, ci]
    st.plotly_chart(array_heatmap(partial, title="C  (filling…)", colorscale_key="amber",
                                  annotation_fmt=".0f",
                                  highlight_cells=[(si, sj)], highlight_color=AMBER),
                    use_container_width=True)
    st.code("C = A @ B  # or np.matmul(A, B)", language="python")
    anim.maybe_advance()

# ──────────────────────────────────────────────────────────────
elif op == "Dot Product (vectors)":
    with st.sidebar:
        length = st.slider("Vector length", 2, 8, 4)
    a = rng.integers(1, 10, length).astype(float)
    b = rng.integers(1, 10, length).astype(float)

    with st.expander("✏️ Edit vectors", expanded=False):
        ec1, ec2 = st.columns(2)
        with ec1:
            a = array_input("a", a, "dp_a")
        with ec2:
            b = array_input("b", b, "dp_b")
    a = a.flatten(); b = b.flatten()
    dot = np.dot(a, b)

    anim = Animator("dot", total_steps=len(a), speed=0.5)
    anim.controls()
    step = anim.current

    hl_a = [(0, step)]; hl_b = [(0, step)]
    d1, d2 = st.columns(2)
    with d1:
        st.plotly_chart(array_heatmap(a, "a", annotation_fmt=".0f",
                                      highlight_cells=hl_a, highlight_color=TEAL),
                        use_container_width=True)
    with d2:
        st.plotly_chart(array_heatmap(b, "b", colorscale_key="purple", annotation_fmt=".0f",
                                      highlight_cells=hl_b, highlight_color=PURPLE),
                        use_container_width=True)

    # Running sum
    running = sum(a[i] * b[i] for i in range(step + 1))
    pairs = " + ".join([f"{a[i]:.0f}×{b[i]:.0f}" for i in range(step + 1)])
    if step < len(a) - 1:
        pairs += " + …"
    formula_bar(f"{pairs} = <b>{running:.0f}</b>", accent=TEAL)
    if step == len(a) - 1:
        big_result(f"{dot:.0f}", "DOT PRODUCT", TEAL)
    anim.maybe_advance()

# ──────────────────────────────────────────────────────────────
elif op == "Determinant":
    with st.sidebar:
        n = st.slider("n × n", 2, 5, 3)
    A = rng.integers(1, 10, (n, n)).astype(float)
    A = array_input("Matrix A", A, "det_a")
    det = np.linalg.det(A)
    st.plotly_chart(array_heatmap(A, f"A ({n}×{n})", annotation_fmt=".0f"), use_container_width=True)
    big_result(f"{det:.4f}", "np.linalg.det(A)", CORAL)
    if abs(det) < 1e-10:
        st.warning("⚠️ Determinant ≈ 0 → matrix is singular.")

elif op == "Inverse":
    with st.sidebar:
        n = st.slider("n × n", 2, 5, 3)
    A = rng.integers(1, 10, (n, n)).astype(float)
    A = array_input("Matrix A", A, "inv_a")
    det = np.linalg.det(A)
    c1, c2 = st.columns(2)
    with c1:
        st.plotly_chart(array_heatmap(A, "A", annotation_fmt=".1f"), use_container_width=True)
    if abs(det) < 1e-10:
        with c2:
            st.error("Matrix is singular – no inverse.")
    else:
        A_inv = np.linalg.inv(A)
        with c2:
            st.plotly_chart(array_heatmap(A_inv, "A⁻¹", colorscale_key="purple",
                                          annotation_fmt=".3f"), use_container_width=True)
        st.markdown("**Verification: A @ A⁻¹ ≈ I**")
        st.plotly_chart(array_heatmap(A @ A_inv, "A @ A⁻¹", colorscale_key="amber",
                                      annotation_fmt=".4f"), use_container_width=True)

elif op == "Trace":
    with st.sidebar:
        n = st.slider("n × n", 2, 6, 4)
    A = rng.integers(1, 15, (n, n)).astype(float)
    A = array_input("Matrix A", A, "trace_a")
    diag_cells = [(i, i) for i in range(A.shape[0])]
    trace = np.trace(A)

    anim = Animator("trace", total_steps=A.shape[0], speed=0.5)
    anim.controls()
    step = anim.current
    hl = diag_cells[:step + 1]
    st.plotly_chart(array_heatmap(A, "A (diagonal)", annotation_fmt=".0f",
                                  highlight_cells=hl, highlight_color=AMBER),
                    use_container_width=True)
    partial_sum = sum(A[i, i] for i in range(step + 1))
    parts = " + ".join(f"{A[i,i]:.0f}" for i in range(step + 1))
    if step < A.shape[0] - 1:
        parts += " + …"
    formula_bar(f"trace = {parts} = <b>{partial_sum:.0f}</b>", accent=AMBER)
    anim.maybe_advance()

elif op == "Eigenvalues":
    with st.sidebar:
        n = st.slider("n × n", 2, 5, 3)
    A = rng.integers(1, 10, (n, n)).astype(float)
    A = array_input("Matrix A", A, "eig_a")
    vals, vecs = np.linalg.eig(A)
    st.plotly_chart(array_heatmap(A, "A", annotation_fmt=".0f"), use_container_width=True)
    st.markdown("---")
    st.plotly_chart(array_heatmap(np.atleast_2d(vals.real), "Eigenvalues λ (real)",
                                  colorscale_key="amber", annotation_fmt=".3f"),
                    use_container_width=True)
    st.plotly_chart(array_heatmap(vecs.real, "Eigenvectors V (columns)",
                                  colorscale_key="purple", annotation_fmt=".3f"),
                    use_container_width=True)
    st.code("vals, vecs = np.linalg.eig(A)", language="python")

elif op == "Matrix Rank":
    with st.sidebar:
        rows = st.slider("Rows", 2, 6, 3)
        cols_n = st.slider("Cols", 2, 6, 4)
    A = rng.integers(0, 8, (rows, cols_n)).astype(float)
    A = array_input("Matrix A", A, "rank_a")
    rank = np.linalg.matrix_rank(A)
    st.plotly_chart(array_heatmap(A, f"A  {A.shape}", annotation_fmt=".0f"), use_container_width=True)
    big_result(str(int(rank)), "np.linalg.matrix_rank(A)", PURPLE)
    st.markdown(f"Max possible rank = min({A.shape[0]}, {A.shape[1]}) = **{min(A.shape)}**")
