"""
Theme constants for NumPy Visualizer.
Dark theme with high-contrast neon accents.
"""

# ── Core Palette ──────────────────────────────────────────────
BG_DARK = "#0a0a0f"
BG_CARD = "#12121f"
BG_SURFACE = "#1a1a2e"
BG_ELEVATED = "#222240"

TEXT_PRIMARY = "#e2e8f0"
TEXT_MUTED = "#64748b"
TEXT_DIM = "#475569"

# Accent colors
TEAL = "#00d4aa"
PURPLE = "#7c3aed"
AMBER = "#f59e0b"
CORAL = "#f43f5e"
CYAN = "#22d3ee"
BLUE = "#3b82f6"
LIME = "#84cc16"
PINK = "#ec4899"

# ── Plotly Colorscales ────────────────────────────────────────
COLORSCALE_TEAL = [
    [0.0, "#0a0a0f"],
    [0.2, "#0d2d3d"],
    [0.4, "#0e4d5a"],
    [0.6, "#0f7d6e"],
    [0.8, "#10b891"],
    [1.0, "#00d4aa"],
]

COLORSCALE_PURPLE = [
    [0.0, "#0a0a0f"],
    [0.2, "#1a1040"],
    [0.4, "#2d1a6e"],
    [0.6, "#4c2a9e"],
    [0.8, "#6c3ace"],
    [1.0, "#7c3aed"],
]

COLORSCALE_AMBER = [
    [0.0, "#0a0a0f"],
    [0.2, "#2d1f00"],
    [0.4, "#5a3d00"],
    [0.6, "#8a6000"],
    [0.8, "#c28500"],
    [1.0, "#f59e0b"],
]

COLORSCALE_DIVERGING = [
    [0.0, "#7c3aed"],
    [0.25, "#3b1a7e"],
    [0.5, "#0a0a0f"],
    [0.75, "#0a5d4d"],
    [1.0, "#00d4aa"],
]

# ── Plotly Layout Defaults ────────────────────────────────────
PLOTLY_LAYOUT = dict(
    paper_bgcolor="rgba(0,0,0,0)",
    plot_bgcolor="rgba(0,0,0,0)",
    font=dict(family="JetBrains Mono, Fira Code, monospace", color=TEXT_PRIMARY, size=12),
    margin=dict(l=10, r=10, t=40, b=10),
    hoverlabel=dict(
        bgcolor=BG_ELEVATED,
        font_size=12,
        font_family="JetBrains Mono, monospace",
        bordercolor=TEAL,
    ),
)

# ── Custom CSS ────────────────────────────────────────────────
CUSTOM_CSS = """
<style>
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap');

/* Hide Streamlit branding */
#MainMenu {visibility: hidden;}
footer {visibility: hidden;}
header {visibility: hidden;}

/* Global font */
html, body, [class*="css"] {
    font-family: 'JetBrains Mono', monospace;
}

h1, h2, h3, h4 {
    font-family: 'Space Grotesk', sans-serif !important;
    letter-spacing: -0.02em;
}

/* Sidebar styling */
[data-testid="stSidebar"] {
    background: linear-gradient(180deg, #0a0a0f 0%, #12121f 100%);
    border-right: 1px solid #1a1a2e;
}

[data-testid="stSidebar"] .stRadio label {
    font-size: 0.9rem;
    padding: 0.4rem 0;
}

/* Metric cards */
[data-testid="stMetric"] {
    background: linear-gradient(135deg, #12121f 0%, #1a1a2e 100%);
    border: 1px solid #222240;
    border-radius: 12px;
    padding: 1rem;
}

[data-testid="stMetricValue"] {
    color: #00d4aa;
    font-family: 'JetBrains Mono', monospace !important;
}

/* Code blocks */
code {
    color: #00d4aa !important;
    background: #12121f !important;
    border: 1px solid #1a1a2e !important;
    border-radius: 6px;
    padding: 2px 6px;
}

/* Expander */
.streamlit-expanderHeader {
    background: #12121f;
    border-radius: 8px;
    border: 1px solid #1a1a2e;
}

/* Slider */
[data-testid="stSlider"] > div > div > div {
    color: #00d4aa;
}

/* Info/success/warning boxes */
.stAlert {
    border-radius: 8px;
    border: 1px solid #222240;
}

/* Tabs */
.stTabs [data-baseweb="tab-list"] {
    gap: 4px;
    background: #12121f;
    border-radius: 10px;
    padding: 4px;
}

.stTabs [data-baseweb="tab"] {
    border-radius: 8px;
    color: #64748b;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.85rem;
}

.stTabs [aria-selected="true"] {
    background: #1a1a2e;
    color: #00d4aa !important;
}

/* Divider */
hr {
    border-color: #1a1a2e !important;
}

/* Custom glow effect class */
.glow-teal {
    text-shadow: 0 0 20px rgba(0, 212, 170, 0.5);
}

/* Selectbox */
[data-baseweb="select"] {
    font-family: 'JetBrains Mono', monospace !important;
}

/* Number input */
[data-testid="stNumberInput"] input {
    font-family: 'JetBrains Mono', monospace !important;
    color: #00d4aa !important;
}
</style>
"""
