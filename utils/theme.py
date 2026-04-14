"""
Dual-theme system for NumPy Visualizer.
Call `init_theme(st)` once, then use `get_theme()` everywhere.
"""

import streamlit as st

# ═══════════════════════════════════════════════════════════════
#  Color palettes
# ═══════════════════════════════════════════════════════════════

DARK = dict(
    bg="#0a0a0f",
    bg_card="#12121f",
    bg_surface="#1a1a2e",
    bg_elevated="#222240",
    text="#e2e8f0",
    text_muted="#64748b",
    text_dim="#475569",
    border="#222240",
    border_accent="#1a1a2e",
    plotly_paper="rgba(0,0,0,0)",
    plotly_plot="rgba(0,0,0,0)",
    plotly_grid="#1a1a2e",
    annotation_color="#e2e8f0",
    hover_bg="#222240",
)

LIGHT = dict(
    bg="#f8fafc",
    bg_card="#ffffff",
    bg_surface="#f1f5f9",
    bg_elevated="#e2e8f0",
    text="#0f172a",
    text_muted="#64748b",
    text_dim="#94a3b8",
    border="#e2e8f0",
    border_accent="#cbd5e1",
    plotly_paper="rgba(0,0,0,0)",
    plotly_plot="rgba(0,0,0,0)",
    plotly_grid="#e2e8f0",
    annotation_color="#0f172a",
    hover_bg="#f1f5f9",
)

# Accents are shared
TEAL = "#00d4aa"
PURPLE = "#7c3aed"
AMBER = "#f59e0b"
CORAL = "#f43f5e"
CYAN = "#22d3ee"
BLUE = "#3b82f6"
LIME = "#84cc16"
PINK = "#ec4899"

# ═══════════════════════════════════════════════════════════════
#  Colorscales
# ═══════════════════════════════════════════════════════════════

def _make_colorscales(theme: str):
    base = "#0a0a0f" if theme == "dark" else "#f8fafc"
    mid_teal = "#0e4d5a" if theme == "dark" else "#a7f3d0"
    mid_purple = "#2d1a6e" if theme == "dark" else "#c4b5fd"
    mid_amber = "#5a3d00" if theme == "dark" else "#fde68a"
    return dict(
        teal=[
            [0.0, base], [0.25, mid_teal if theme == "dark" else "#6ee7b7"],
            [0.5, "#0f7d6e" if theme == "dark" else "#34d399"],
            [0.75, "#10b891" if theme == "dark" else "#10b981"],
            [1.0, TEAL],
        ],
        purple=[
            [0.0, base], [0.25, mid_purple if theme == "dark" else "#ddd6fe"],
            [0.5, "#4c2a9e" if theme == "dark" else "#a78bfa"],
            [0.75, "#6c3ace" if theme == "dark" else "#8b5cf6"],
            [1.0, PURPLE],
        ],
        amber=[
            [0.0, base], [0.25, mid_amber if theme == "dark" else "#fef3c7"],
            [0.5, "#8a6000" if theme == "dark" else "#fbbf24"],
            [0.75, "#c28500" if theme == "dark" else "#f59e0b"],
            [1.0, AMBER],
        ],
    )


# ═══════════════════════════════════════════════════════════════
#  Theme state helpers
# ═══════════════════════════════════════════════════════════════

def init_theme():
    """Initialise session-state defaults. Call once per page."""
    if "theme" not in st.session_state:
        st.session_state.theme = "dark"


def toggle_theme():
    """Flip between dark and light."""
    st.session_state.theme = "light" if st.session_state.theme == "dark" else "dark"


def get_colors() -> dict:
    """Return the active palette dict."""
    return DARK if st.session_state.get("theme", "dark") == "dark" else LIGHT


def get_colorscales() -> dict:
    """Return colorscale dict for current theme."""
    return _make_colorscales(st.session_state.get("theme", "dark"))


def get_plotly_layout() -> dict:
    c = get_colors()
    return dict(
        paper_bgcolor=c["plotly_paper"],
        plot_bgcolor=c["plotly_plot"],
        font=dict(family="JetBrains Mono, Fira Code, monospace", color=c["text"], size=12),
        margin=dict(l=10, r=10, t=40, b=10),
        hoverlabel=dict(
            bgcolor=c["hover_bg"],
            font_size=12,
            font_family="JetBrains Mono, monospace",
            bordercolor=TEAL,
        ),
    )


# ═══════════════════════════════════════════════════════════════
#  CSS injection
# ═══════════════════════════════════════════════════════════════

def inject_css():
    """Inject the right CSS block for the active theme."""
    c = get_colors()
    is_dark = st.session_state.get("theme", "dark") == "dark"

    # Streamlit override layer
    override = f"""
    <style>
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap');

    /* ── streamlit root overrides ─────────────────────── */
    .stApp {{
        background: {c['bg']} !important;
    }}

    #MainMenu {{visibility: hidden;}}
    footer {{visibility: hidden;}}
    header {{visibility: hidden;}}

    html, body, [class*="css"] {{
        font-family: 'JetBrains Mono', monospace;
        color: {c['text']};
    }}
    h1, h2, h3, h4 {{
        font-family: 'Space Grotesk', sans-serif !important;
        letter-spacing: -0.02em;
        color: {c['text']} !important;
    }}
    p, span, li, label, div {{
        color: {c['text']};
    }}

    /* ── sidebar ────────────────────────────────────────── */
    [data-testid="stSidebar"] {{
        background: {'linear-gradient(180deg, #0a0a0f 0%, #12121f 100%)' if is_dark else 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)'} !important;
        border-right: 1px solid {c['border']};
    }}
    [data-testid="stSidebar"] * {{
        color: {c['text']} !important;
    }}

    /* ── metric cards ───────────────────────────────────── */
    [data-testid="stMetric"] {{
        background: {c['bg_card']};
        border: 1px solid {c['border']};
        border-radius: 12px;
        padding: 1rem;
    }}
    [data-testid="stMetricValue"] {{
        color: {TEAL} !important;
        font-family: 'JetBrains Mono', monospace !important;
    }}

    /* ── code ───────────────────────────────────────────── */
    code {{
        color: {TEAL} !important;
        background: {c['bg_card']} !important;
        border: 1px solid {c['border']} !important;
        border-radius: 6px;
        padding: 2px 6px;
    }}
    pre {{
        background: {c['bg_card']} !important;
        border: 1px solid {c['border']} !important;
    }}

    /* ── tabs ───────────────────────────────────────────── */
    .stTabs [data-baseweb="tab-list"] {{
        gap: 4px;
        background: {c['bg_card']};
        border-radius: 10px;
        padding: 4px;
    }}
    .stTabs [data-baseweb="tab"] {{
        border-radius: 8px;
        color: {c['text_muted']};
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.85rem;
    }}
    .stTabs [aria-selected="true"] {{
        background: {c['bg_surface']};
        color: {TEAL} !important;
    }}

    /* ── inputs ─────────────────────────────────────────── */
    [data-baseweb="select"] {{
        font-family: 'JetBrains Mono', monospace !important;
    }}
    [data-testid="stNumberInput"] input {{
        font-family: 'JetBrains Mono', monospace !important;
        color: {TEAL} !important;
    }}
    input, textarea {{
        color: {c['text']} !important;
        background: {c['bg_card']} !important;
    }}

    /* ── dividers ───────────────────────────────────────── */
    hr {{
        border-color: {c['border']} !important;
    }}

    /* ── expander ───────────────────────────────────────── */
    .streamlit-expanderHeader {{
        background: {c['bg_card']};
        border-radius: 8px;
        border: 1px solid {c['border']};
        color: {c['text']} !important;
    }}

    /* ── data editor ────────────────────────────────────── */
    [data-testid="stDataFrame"] {{
        border: 1px solid {c['border']} !important;
        border-radius: 8px;
    }}

    /* ── animation control buttons ──────────────────────── */
    .anim-btn button {{
        border: 1px solid {c['border']} !important;
        border-radius: 8px;
        font-family: 'JetBrains Mono', monospace !important;
        font-size: 0.85rem;
    }}

    /* ── selectbox / radio bg fix ───────────────────────── */
    [data-baseweb="popover"] {{
        background: {c['bg_card']} !important;
    }}
    [data-baseweb="menu"] {{
        background: {c['bg_card']} !important;
    }}
    [role="listbox"] {{
        background: {c['bg_card']} !important;
    }}
    [role="option"] {{
        background: {c['bg_card']} !important;
        color: {c['text']} !important;
    }}
    [role="option"]:hover {{
        background: {c['bg_surface']} !important;
    }}
    </style>
    """
    st.markdown(override, unsafe_allow_html=True)


# ═══════════════════════════════════════════════════════════════
#  Shared sidebar chrome
# ═══════════════════════════════════════════════════════════════

def sidebar_chrome():
    """Render common sidebar header + theme toggle. Call on every page."""
    c = get_colors()
    with st.sidebar:
        st.markdown(
            f"""
            <div style="text-align:center; padding:0.5rem 0 0.2rem 0;">
                <span style="font-size:1.4rem;">🔬</span><br>
                <span style="font-family:'Space Grotesk',sans-serif; font-weight:700;
                             font-size:0.95rem; color:{TEAL};">
                    NumPy Visualizer
                </span>
                <br>
                <span style="font-size:0.65rem; color:{c['text_dim']};">v2.0</span>
            </div>
            """,
            unsafe_allow_html=True,
        )
        col_l, col_r = st.columns([3, 2])
        with col_r:
            icon = "🌙" if st.session_state.get("theme") == "dark" else "☀️"
            if st.button(icon, key="_theme_toggle", help="Toggle light / dark theme"):
                toggle_theme()
                st.rerun()
        st.markdown("---")


# ═══════════════════════════════════════════════════════════════
#  Page init helper (call at top of every page)
# ═══════════════════════════════════════════════════════════════

def page_setup(title: str, icon: str, layout: str = "wide"):
    """One-liner page bootstrap: config → theme init → CSS → sidebar."""
    st.set_page_config(page_title=title, page_icon=icon, layout=layout)
    init_theme()
    inject_css()
    sidebar_chrome()
