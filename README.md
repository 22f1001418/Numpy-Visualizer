# 🔬 NumPy Visualizer

An interactive Streamlit application that lets you **see** NumPy operations as they happen — heatmap grids, step-by-step matrix multiplication, broadcasting expansion, slicing highlights, and more.

---

## Features

| Page | What it covers |
|---|---|
| **Array Basics** | `arange`, random arrays, `reshape`, `transpose`, `flatten` (C vs F order) |
| **Element-wise Ops** | `+  −  ×  ÷  **  %  >` on array↔array or array↔scalar, with cell-by-cell walkthrough |
| **Matrix Operations** | Step-through `matmul`, dot product, determinant, inverse, trace, eigenvalues |
| **Broadcasting** | Preset and custom shape pairs; shows original → virtual expansion → result |
| **Slicing & Indexing** | Basic slices, fancy indexing, boolean masks, stride tricks — highlighted on the source array |
| **Aggregations** | `sum  mean  min  max  std  prod` along `axis=0 / 1 / None`, with bar-chart view |

Every page includes:
- Live sidebar controls (shape, seed, operation)
- Annotated Plotly heatmaps with highlighted cells
- The equivalent NumPy code snippet
- Expandable explainers for the underlying mechanics

---

## Prerequisites

- **Python 3.10+** (tested on 3.11 and 3.12)
- **pip** (or any Python package manager)

---

## Dependencies

| Package | Min Version | Purpose |
|---|---|---|
| `streamlit` | 1.40.0 | App framework + multi-page routing |
| `numpy` | 2.0.0 | The library being visualized |
| `plotly` | 5.24.0 | Interactive heatmaps and charts |

All dependencies are listed in `requirements.txt`.

---

## Quick Start

```bash
# 1. Clone / unzip the project
cd numpy_visualizer

# 2. (Recommended) Create a virtual environment
python -m venv .venv
source .venv/bin/activate        # macOS / Linux
# .venv\Scripts\activate         # Windows

# 3. Install dependencies
pip install -r requirements.txt

# 4. Run the app
streamlit run Home.py
```

The app will open at **http://localhost:8501** by default.

---

## Project Structure

```
numpy_visualizer/
├── Home.py                      # Landing page
├── pages/
│   ├── 1_Array_Basics.py        # Create, reshape, transpose
│   ├── 2_Elementwise_Ops.py     # +, −, ×, ÷, **, %, >
│   ├── 3_Matrix_Operations.py   # matmul, det, inv, eig
│   ├── 4_Broadcasting.py        # Shape expansion
│   ├── 5_Slicing_Indexing.py    # Slices, fancy idx, masks
│   └── 6_Aggregations.py        # sum, mean, min, max, std
├── utils/
│   ├── __init__.py
│   ├── theme.py                 # Colors, CSS, Plotly defaults
│   └── viz.py                   # Heatmap / highlight helpers
├── .streamlit/
│   └── config.toml              # Dark theme config
├── requirements.txt
└── README.md
```

---

## Customisation

- **Theme colours** — edit `utils/theme.py` (CSS variables + Plotly colorscales).
- **Add a new page** — drop a `.py` file in `pages/` prefixed with a number. Streamlit auto-discovers it.
- **Deploy** — works out of the box on [Streamlit Community Cloud](https://streamlit.io/cloud), Heroku, Railway, or any Docker host.

---

## License

MIT — use freely for teaching, demos, or internal tooling.
