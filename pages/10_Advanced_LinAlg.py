"""
Page 10 – Advanced Linear Algebra: SVD, QR, solve, norm.
"""

import streamlit as st
import numpy as np
from utils.theme import page_setup, get_colors, TEAL, PURPLE, AMBER, CYAN, CORAL
from utils.viz import array_heatmap, shape_badge, array_input, formula_bar, big_result

page_setup("Advanced LinAlg", "🧮")
c = get_colors()

st.markdown(f'<h2 style="color:{CYAN};">🧮 Advanced Linear Algebra</h2>', unsafe_allow_html=True)
st.caption("SVD, QR decomposition, linear solve, and matrix norms — fully visualised.")
st.markdown("---")

with st.sidebar:
    st.subheader("Operation")
    op = st.radio("Choose", ["SVD", "QR Decomposition", "Solve (Ax = b)",
                              "Matrix Norm", "Condition Number"])
    st.markdown("---")
    seed = st.number_input("Seed", value=13, step=1)

rng = np.random.default_rng(int(seed))

# ══════════════════════════════════════════════════════════════
if op == "SVD":
    with st.sidebar:
        rows = st.slider("Rows", 2, 6, 3)
        cols_n = st.slider("Cols", 2, 6, 4)
    A = rng.integers(1, 10, (rows, cols_n)).astype(float)
    with st.expander("✏️ Edit A", expanded=False):
        A = array_input("A", A, "svd_a")

    U, S, Vt = np.linalg.svd(A, full_matrices=False)

    st.markdown(f"**A** {shape_badge(A.shape)} = **U** · **diag(σ)** · **Vᵀ**", unsafe_allow_html=True)
    st.markdown("")

    st.plotly_chart(array_heatmap(A, f"A  {A.shape}", annotation_fmt=".1f"), use_container_width=True)

    st.markdown("---")
    d1, d2, d3 = st.columns(3)
    with d1:
        st.plotly_chart(array_heatmap(U, f"U  {U.shape}", annotation_fmt=".3f"),
                        use_container_width=True)
    with d2:
        S_diag = np.diag(S)
        st.plotly_chart(array_heatmap(S_diag, f"diag(σ)  {S_diag.shape}", colorscale_key="amber",
                                      annotation_fmt=".3f"), use_container_width=True)
        st.markdown("**Singular values:**")
        for i, sv in enumerate(S):
            st.markdown(f"- σ{i+1} = `{sv:.4f}`")
    with d3:
        st.plotly_chart(array_heatmap(Vt, f"Vᵀ  {Vt.shape}", colorscale_key="purple",
                                      annotation_fmt=".3f"), use_container_width=True)

    # Verify reconstruction
    st.markdown("---")
    A_reconstructed = U @ np.diag(S) @ Vt
    st.markdown("**Verification: U · diag(σ) · Vᵀ ≈ A**")
    st.plotly_chart(array_heatmap(A_reconstructed, "Reconstructed", colorscale_key="amber",
                                  annotation_fmt=".3f"), use_container_width=True)
    st.code("U, S, Vt = np.linalg.svd(A, full_matrices=False)", language="python")

elif op == "QR Decomposition":
    with st.sidebar:
        n = st.slider("n × n", 2, 5, 3)
    A = rng.integers(1, 10, (n, n)).astype(float)
    with st.expander("✏️ Edit A", expanded=False):
        A = array_input("A", A, "qr_a")

    Q, R = np.linalg.qr(A)

    st.markdown(f"**A** = **Q** (orthogonal) · **R** (upper triangular)")
    st.plotly_chart(array_heatmap(A, f"A  {A.shape}", annotation_fmt=".1f"), use_container_width=True)

    st.markdown("---")
    d1, d2 = st.columns(2)
    with d1:
        st.plotly_chart(array_heatmap(Q, f"Q  {Q.shape}", annotation_fmt=".3f"),
                        use_container_width=True)
        st.markdown("**Qᵀ Q ≈ I** (orthogonality check):")
        st.plotly_chart(array_heatmap(Q.T @ Q, "Qᵀ Q", colorscale_key="amber",
                                      annotation_fmt=".4f"), use_container_width=True)
    with d2:
        # Highlight upper triangle
        hl = [(i, j) for i in range(R.shape[0]) for j in range(i, R.shape[1])]
        st.plotly_chart(array_heatmap(R, f"R  {R.shape}", colorscale_key="purple",
                                      annotation_fmt=".3f",
                                      highlight_cells=hl, highlight_color=PURPLE),
                        use_container_width=True)

    st.markdown("**Verify: Q @ R ≈ A**")
    st.plotly_chart(array_heatmap(Q @ R, "Q @ R", colorscale_key="amber", annotation_fmt=".3f"),
                    use_container_width=True)
    st.code("Q, R = np.linalg.qr(A)", language="python")

elif op == "Solve (Ax = b)":
    with st.sidebar:
        n = st.slider("n (equations)", 2, 5, 3)
    A = rng.integers(1, 8, (n, n)).astype(float)
    b = rng.integers(1, 20, n).astype(float)

    with st.expander("✏️ Edit A and b", expanded=False):
        ec1, ec2 = st.columns(2)
        with ec1:
            A = array_input("A (coefficient matrix)", A, "solve_a")
        with ec2:
            b = array_input("b (constants)", b, "solve_b").flatten()

    det = np.linalg.det(A)
    d1, d2 = st.columns(2)
    with d1:
        st.plotly_chart(array_heatmap(A, f"A  {A.shape}", annotation_fmt=".0f"),
                        use_container_width=True)
    with d2:
        st.plotly_chart(array_heatmap(b.reshape(-1, 1), "b", colorscale_key="purple",
                                      annotation_fmt=".0f"), use_container_width=True)

    if abs(det) < 1e-10:
        st.error("det(A) ≈ 0 — system has no unique solution.")
    else:
        x = np.linalg.solve(A, b)
        st.markdown("---")
        st.markdown("**Solution x:**")
        st.plotly_chart(array_heatmap(x.reshape(-1, 1), "x = solve(A, b)", colorscale_key="amber",
                                      annotation_fmt=".4f"), use_container_width=True)

        # Show equation system
        eqs = []
        for i in range(n):
            terms = " + ".join(f"{A[i,j]:.0f}·x{j}" for j in range(n))
            eqs.append(f"{terms} = {b[i]:.0f}")
        st.markdown("**System:**")
        for eq in eqs:
            st.markdown(f"&nbsp;&nbsp;&nbsp;&nbsp;`{eq}`")

        # Verify
        st.markdown("**Verify: A @ x ≈ b**")
        st.plotly_chart(array_heatmap((A @ x).reshape(-1, 1), "A @ x", colorscale_key="amber",
                                      annotation_fmt=".4f"), use_container_width=True)
    st.code("x = np.linalg.solve(A, b)", language="python")

elif op == "Matrix Norm":
    with st.sidebar:
        rows = st.slider("Rows", 2, 6, 3)
        cols_n = st.slider("Cols", 2, 6, 4)
        norm_type = st.selectbox("Norm", ["Frobenius", "L1 (max col sum)", "L∞ (max row sum)",
                                           "Spectral (L2)"])
    A = rng.integers(1, 10, (rows, cols_n)).astype(float)
    with st.expander("✏️ Edit A", expanded=False):
        A = array_input("A", A, "norm_a")

    norm_map = {"Frobenius": "fro", "L1 (max col sum)": 1,
                "L∞ (max row sum)": np.inf, "Spectral (L2)": 2}
    ord_val = norm_map[norm_type]
    nval = np.linalg.norm(A, ord=ord_val)

    st.plotly_chart(array_heatmap(A, f"A  {A.shape}", annotation_fmt=".0f"), use_container_width=True)

    if norm_type == "Frobenius":
        sq = A ** 2
        st.plotly_chart(array_heatmap(sq, "A² (element-wise)", colorscale_key="amber",
                                      annotation_fmt=".0f"), use_container_width=True)
        formula_bar(f"‖A‖_F = √(Σ aᵢⱼ²) = √{sq.sum():.0f} = <b>{nval:.4f}</b>", accent=TEAL)
    else:
        big_result(f"{nval:.4f}", f"‖A‖ ({norm_type})", AMBER)

    st.code(f"np.linalg.norm(A, ord={repr(ord_val)})", language="python")

elif op == "Condition Number":
    with st.sidebar:
        n = st.slider("n × n", 2, 5, 3)
    A = rng.integers(1, 10, (n, n)).astype(float)
    with st.expander("✏️ Edit A", expanded=False):
        A = array_input("A", A, "cond_a")

    cond = np.linalg.cond(A)
    st.plotly_chart(array_heatmap(A, f"A  {A.shape}", annotation_fmt=".0f"), use_container_width=True)
    big_result(f"{cond:.2f}", "Condition Number κ(A)", AMBER)

    if cond > 100:
        st.warning("⚠️ High condition number — matrix is ill-conditioned. Small input changes cause large output changes.")
    elif cond < 10:
        st.success("✅ Low condition number — well-conditioned matrix.")
    st.code("np.linalg.cond(A)", language="python")
