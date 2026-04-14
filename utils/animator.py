"""
Reusable step-by-step animation controller for Streamlit.

Usage:
    from utils.animator import Animator
    anim = Animator("matmul", total_steps=12)
    anim.controls()          # renders ⏮ ◀ ▶/⏸ ▶ ⏭  buttons + progress
    step = anim.current      # current step index (0-based)
    anim.maybe_advance()     # call at END of page – auto-advances if playing
"""

import time
import streamlit as st
from utils.theme import get_colors, TEAL


class Animator:
    """Encapsulates play/pause/step state for one animation per page."""

    def __init__(self, key: str, total_steps: int, speed: float = 0.6):
        self.key = key
        self.total = max(total_steps, 1)
        self.speed = speed
        self._sk = f"_anim_{key}_step"
        self._pk = f"_anim_{key}_playing"
        if self._sk not in st.session_state:
            st.session_state[self._sk] = 0
        if self._pk not in st.session_state:
            st.session_state[self._pk] = False

    # ── properties ────────────────────────────────────────
    @property
    def current(self) -> int:
        return int(st.session_state[self._sk])

    @current.setter
    def current(self, v: int):
        st.session_state[self._sk] = max(0, min(v, self.total - 1))

    @property
    def playing(self) -> bool:
        return bool(st.session_state[self._pk])

    @playing.setter
    def playing(self, v: bool):
        st.session_state[self._pk] = v

    # ── UI ────────────────────────────────────────────────
    def controls(self):
        """Render transport bar: Reset | Prev | Play/Pause | Next | End."""
        c = get_colors()
        cols = st.columns([1, 1, 1.2, 1, 1, 3])
        with cols[0]:
            if st.button("⏮", key=f"{self.key}_reset", help="Reset to step 0"):
                self.current = 0
                self.playing = False
        with cols[1]:
            if st.button("◀", key=f"{self.key}_prev", help="Previous step"):
                self.playing = False
                self.current = self.current - 1
        with cols[2]:
            label = "⏸ Pause" if self.playing else "▶ Play"
            if st.button(label, key=f"{self.key}_play"):
                self.playing = not self.playing
        with cols[3]:
            if st.button("▶", key=f"{self.key}_next", help="Next step"):
                self.playing = False
                self.current = self.current + 1
        with cols[4]:
            if st.button("⏭", key=f"{self.key}_end", help="Jump to last step"):
                self.playing = False
                self.current = self.total - 1
        with cols[5]:
            pct = (self.current + 1) / self.total
            st.progress(pct, text=f"Step {self.current + 1} / {self.total}")

    def maybe_advance(self):
        """Put this at the VERY END of the page. Auto-advances when playing."""
        if self.playing:
            if self.current < self.total - 1:
                time.sleep(self.speed)
                self.current = self.current + 1
                st.rerun()
            else:
                self.playing = False
                st.rerun()
