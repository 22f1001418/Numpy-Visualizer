# 🔬 NumPy Visualizer v2.0

An interactive Streamlit application that lets you **see** NumPy operations as they happen — animated step-by-step, with editable inputs, light/dark theme toggle, and 10 operation categories.

---

## What's New in v2.0

- **🌙/☀️ Theme Toggle** — switch between dark and light mode from any page via the sidebar button
- **🎬 Step-by-step Animations** — play/pause/step transport controls on every operation; watch computations build cell by cell at adjustable speed
- **✏️ Editable Inputs** — toggle any array between Random and Manual mode; edit values directly in an inline data-editor grid
- **4 New Operation Pages** — Stacking & Splitting, Sorting, Cumulative Ops, Advanced Linear Algebra
- **Sidebar-safe Navigation** — clickable page links on the Home screen so collapsing the sidebar is never a dead end

---

## Pages

| # | Page | Operations |
|---|---|---|
| 1 | **Array Basics** | `arange`, random, `reshape` (animated fill), `transpose` (cell mapping), `flatten` (C vs F animated) |
| 2 | **Element-wise Ops** | `+ − × ÷ ** % // >` with animated cell-by-cell walkthrough |
| 3 | **Matrix Operations** | Animated `matmul`, dot product (running sum), `det`, `inv` (+verification), `trace` (animated), `eig`, `matrix_rank` |
| 4 | **Broadcasting** | 3-stage animation: originals → virtual expansion → element-wise result building |
| 5 | **Slicing & Indexing** | Basic slice, fancy indexing, boolean mask (animated scan), strides, `np.where` |
| 6 | **Aggregations** | `sum mean min max std prod` along axis 0/1/None — animated group-by-group collapse + bar chart |
| 7 | **Stacking & Splitting** | `vstack` (animated row), `hstack` (animated col), `concatenate`, `split` |
| 8 | **Sorting** | `sort` (1D animated bar chart + 2D axis), `argsort` (animated index tracing), `partition`, `unique` + counts |
| 9 | **Cumulative Ops** | `cumsum` (1D animated + line chart, 2D axis), `cumprod`, `diff`, `percentile` |
| 10 | **Advanced LinAlg** | `SVD` (U·σ·Vᵀ + reconstruction), `QR` (orthogonality check), `solve` (equation display + verify), `norm` (Frobenius breakdown), `cond` |

---

## Prerequisites

- **Python 3.10+** (tested on 3.11, 3.12)
- **pip**

## Dependencies

| Package | Min Version | Purpose |
|---|---|---|
| `streamlit` | 1.40.0 | App framework, multi-page, `data_editor`, `page_link` |
| `numpy` | 2.0.0 | The library being visualised |
| `plotly` | 5.24.0 | Interactive heatmaps, bar charts, line charts |
| `pandas` | 2.2.0 | Powers `st.data_editor` for manual array input |

---

## Quick Start

```bash
cd numpy_visualizer
python -m venv .venv
source .venv/bin/activate      # macOS / Linux
# .venv\Scripts\activate       # Windows

pip install -r requirements.txt
streamlit run Home.py
```

Opens at **http://localhost:8501**.

---

## Project Structure

```
numpy_visualizer/
├── Home.py                          # Landing page + in-content navigation
├── pages/
│   ├── 1_Array_Basics.py
│   ├── 2_Elementwise_Ops.py
│   ├── 3_Matrix_Operations.py
│   ├── 4_Broadcasting.py
│   ├── 5_Slicing_Indexing.py
│   ├── 6_Aggregations.py
│   ├── 7_Stacking_Splitting.py      # NEW
│   ├── 8_Sorting.py                 # NEW
│   ├── 9_Cumulative_Ops.py          # NEW
│   └── 10_Advanced_LinAlg.py        # NEW
├── utils/
│   ├── __init__.py
│   ├── theme.py                     # Dual-theme system + CSS injection
│   ├── viz.py                       # Heatmap renderer + array_input widget
│   └── animator.py                  # NEW – play/pause/step controller
├── .streamlit/
│   └── config.toml
├── requirements.txt
└── README.md
```

---

## How the Animation System Works

Every animated page uses `utils/animator.py`:

```python
from utils.animator import Animator

anim = Animator("unique_key", total_steps=20, speed=0.6)
anim.controls()        # renders ⏮ ◀ ▶/⏸ ▶ ⏭ + progress bar
step = anim.current    # 0-based step index

# ... render visuals for `step` ...

anim.maybe_advance()   # MUST be last — triggers st.rerun() when playing
```

Speed is seconds between frames (lower = faster). Each page picks a speed that feels natural for the operation.

---

## Customisation

| What | Where |
|---|---|
| Colors & accents | `utils/theme.py` → `DARK` / `LIGHT` dicts + accent constants |
| Plotly colorscales | `utils/theme.py` → `_make_colorscales()` |
| Animation speed | Each page's `Animator(speed=...)` call |
| Add a new page | Drop a numbered `.py` in `pages/` — Streamlit auto-discovers it |

---

## Deployment

Works out of the box on:
- [Streamlit Community Cloud](https://streamlit.io/cloud) (free)
- Docker / Railway / Render — just set entrypoint to `streamlit run Home.py`
- Any server with Python 3.10+

---

## License

MIT — use freely for teaching, demos, or internal tooling.
