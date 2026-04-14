"""
NumPy Visualizer – Interactive visual exploration of NumPy operations.
Home / Landing page.
"""

import streamlit as st
from utils.theme import CUSTOM_CSS, TEAL, PURPLE, AMBER, CORAL, CYAN

st.set_page_config(
    page_title="NumPy Visualizer",
    page_icon="🔬",
    layout="wide",
    initial_sidebar_state="expanded",
)

st.markdown(CUSTOM_CSS, unsafe_allow_html=True)

# ── Hero Section ──────────────────────────────────────────────
st.markdown(
    f"""
    <div style="text-align:center; padding: 2rem 0 1rem 0;">
        <h1 style="font-size:3rem; font-weight:700; margin-bottom:0.2rem;
                    background: linear-gradient(135deg, {TEAL}, {CYAN});
                    -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
            NumPy Visualizer
        </h1>
        <p style="color:#64748b; font-size:1.1rem; font-family:'JetBrains Mono',monospace; margin-top:0;">
            See every operation. Understand every computation.
        </p>
    </div>
    """,
    unsafe_allow_html=True,
)

st.markdown("---")

# ── Feature Cards ─────────────────────────────────────────────
cards = [
    ("🔢", "Array Basics", "Create, reshape, and transpose arrays with live visual feedback.",
     TEAL, "1_Array_Basics"),
    ("➕", "Element-wise Ops", "Add, subtract, multiply, divide – watch each cell update in real time.",
     PURPLE, "2_Elementwise_Ops"),
    ("✖️", "Matrix Operations", "Step through matrix multiplication, see dot products cell-by-cell.",
     AMBER, "3_Matrix_Operations"),
    ("📡", "Broadcasting", "Visualize how NumPy stretches arrays to make shapes compatible.",
     CORAL, "4_Broadcasting"),
    ("✂️", "Slicing & Indexing", "Highlight sub-arrays, fancy indexing, and boolean masks.",
     CYAN, "5_Slicing_Indexing"),
    ("📊", "Aggregations", "Sum, mean, min, max along axes – see the collapse in action.",
     TEAL, "6_Aggregations"),
]


def card_html(icon, title, desc, accent):
    return f"""
    <div style="
        background: linear-gradient(135deg, #12121f 0%, #1a1a2e 100%);
        border: 1px solid #222240;
        border-left: 3px solid {accent};
        border-radius: 12px;
        padding: 1.5rem;
        height: 160px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        transition: border-color 0.3s;
    ">
        <div style="font-size:1.8rem; margin-bottom:0.5rem;">{icon}</div>
        <div style="font-size:1.1rem; font-weight:600; color:{accent};
                     font-family:'Space Grotesk',sans-serif; margin-bottom:0.3rem;">
            {title}
        </div>
        <div style="font-size:0.8rem; color:#64748b; line-height:1.4;">
            {desc}
        </div>
    </div>
    """


cols = st.columns(3)
for idx, (icon, title, desc, accent, _page) in enumerate(cards):
    with cols[idx % 3]:
        st.markdown(card_html(icon, title, desc, accent), unsafe_allow_html=True)
        st.write("")  # spacer

st.markdown("---")

# ── Quick Start ───────────────────────────────────────────────
st.markdown(
    f"""
    <div style="text-align:center; padding:1rem 0;">
        <p style="color:#64748b; font-size:0.95rem;">
            👈 Pick a category from the <b style="color:{TEAL};">sidebar</b> to start exploring.
        </p>
    </div>
    """,
    unsafe_allow_html=True,
)

# ── Sidebar branding ─────────────────────────────────────────
with st.sidebar:
    st.markdown(
        f"""
        <div style="text-align:center; padding:1rem 0 0.5rem 0;">
            <span style="font-size:1.5rem;">🔬</span><br>
            <span style="font-family:'Space Grotesk',sans-serif; font-weight:700;
                         font-size:1rem; color:{TEAL};">
                NumPy Visualizer
            </span>
            <br>
            <span style="font-size:0.7rem; color:#475569;">v1.0 · Streamlit</span>
        </div>
        """,
        unsafe_allow_html=True,
    )
    st.markdown("---")
    st.caption("Navigate using the pages above ☝️")
