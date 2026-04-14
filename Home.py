"""
NumPy Visualizer – Home / Landing page.
Navigation works even with the sidebar collapsed via st.page_link.
"""

import streamlit as st
from utils.theme import (
    init_theme, inject_css, sidebar_chrome,
    get_colors, TEAL, PURPLE, AMBER, CORAL, CYAN, LIME,
)

# ── page bootstrap ────────────────────────────────────────────
st.set_page_config(page_title="NumPy Visualizer", page_icon="🔬",
                   layout="wide", initial_sidebar_state="expanded")
init_theme()
inject_css()
sidebar_chrome()

c = get_colors()

# ── Hero ──────────────────────────────────────────────────────
st.markdown(
    f"""
    <div style="text-align:center; padding:2rem 0 0.5rem 0;">
        <h1 style="font-size:3rem; font-weight:700; margin-bottom:0.2rem;
                    background:linear-gradient(135deg,{TEAL},{CYAN});
                    -webkit-background-clip:text; -webkit-text-fill-color:transparent;">
            NumPy Visualizer
        </h1>
        <p style="color:{c['text_muted']}; font-size:1.05rem;
                  font-family:'JetBrains Mono',monospace; margin-top:0;">
            See every operation · Understand every computation
        </p>
    </div>
    """,
    unsafe_allow_html=True,
)

st.markdown("---")

# ── Navigation cards (work even with sidebar collapsed) ──────
pages = [
    ("🔢", "Array Basics",       "Create, reshape, transpose arrays with live visual feedback.",             TEAL,   "pages/1_Array_Basics.py"),
    ("➕", "Element-wise Ops",    "Add, subtract, multiply – watch each cell update step by step.",           PURPLE, "pages/2_Elementwise_Ops.py"),
    ("✖️", "Matrix Operations",  "Step through matmul cell-by-cell, view det / inverse / eigen.",            AMBER,  "pages/3_Matrix_Operations.py"),
    ("📡", "Broadcasting",        "Visualize how NumPy stretches arrays to compatible shapes.",               CORAL,  "pages/4_Broadcasting.py"),
    ("✂️", "Slicing & Indexing",  "Highlight sub-arrays, fancy indexing, boolean masks.",                     CYAN,   "pages/5_Slicing_Indexing.py"),
    ("📊", "Aggregations",        "sum, mean, min, max along axes – animated collapse.",                      TEAL,   "pages/6_Aggregations.py"),
    ("📐", "Stacking & Splitting","vstack, hstack, concatenate, split – see shapes merge and divide.",       PURPLE, "pages/7_Stacking_Splitting.py"),
    ("🔃", "Sorting",             "sort, argsort, partition – animated element movement.",                    AMBER,  "pages/8_Sorting.py"),
    ("📈", "Cumulative Ops",      "cumsum, cumprod, diff – watch running totals build cell by cell.",         CORAL,  "pages/9_Cumulative_Ops.py"),
    ("🧮", "Advanced LinAlg",     "SVD, QR decomposition, solve – full matrix decomposition visuals.",       CYAN,   "pages/10_Advanced_LinAlg.py"),
]


def card_html(icon, title, desc, accent):
    return f"""
    <div style="
        background: {c['bg_card']};
        border: 1px solid {c['border']};
        border-left: 3px solid {accent};
        border-radius: 12px;
        padding: 1.2rem 1.4rem;
        min-height: 120px;
        display: flex; flex-direction: column; justify-content: center;
    ">
        <div style="font-size:1.6rem; margin-bottom:0.4rem;">{icon}</div>
        <div style="font-size:1rem; font-weight:600; color:{accent};
                     font-family:'Space Grotesk',sans-serif; margin-bottom:0.25rem;">
            {title}
        </div>
        <div style="font-size:0.78rem; color:{c['text_muted']}; line-height:1.4;">
            {desc}
        </div>
    </div>
    """


# Render 2 rows × 5 cols of clickable page links
for row_start in range(0, len(pages), 5):
    row_items = pages[row_start: row_start + 5]
    cols = st.columns(len(row_items))
    for idx, (icon, title, desc, accent, path) in enumerate(row_items):
        with cols[idx]:
            st.markdown(card_html(icon, title, desc, accent), unsafe_allow_html=True)
            st.page_link(path, label=f"Open {title} →", icon=icon)

st.markdown("---")

# ── Quick-start info ──────────────────────────────────────────
st.markdown(
    f"""
    <div style="text-align:center; padding:0.5rem 0 1rem 0; color:{c['text_muted']}; font-size:0.9rem;">
        Click any card above <b>or</b> use the sidebar to navigate.
        Toggle 🌙 / ☀️ in the sidebar for light / dark theme.
    </div>
    """,
    unsafe_allow_html=True,
)
