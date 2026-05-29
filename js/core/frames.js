/* ═══════════════════════════════════════════════════════════
   frames.js — Frame system for game layout switching
   To add a frame: add entry to FRAMES + FRAME_ICONS + frames.css body.frame--N block.
   To remove a frame: delete its entry from FRAMES + FRAME_ICONS + its CSS block.
   ═══════════════════════════════════════════════════════════ */

'use strict';

/* ── Frame definitions ─────────────────────────────────────── */
const FRAMES = {
  1: { id: 1, title: 'Transparent Board' },
  2: { id: 2, title: 'Standard'          },
  3: { id: 3, title: 'Dual Board'        },
  4: { id: 4, title: 'Dual Board Alt'    },
};

/* ── Mini layout icons (inline SVG, 20×20 canvas) ─────────── */
const FRAME_ICONS = {
  /* Frame 1: single outlined rectangle (transparent board) */
  1: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect class="board-outline" x="2.5" y="3.5" width="15" height="13" rx="2"
              stroke="rgba(27,58,107,0.55)" stroke-width="1.5" fill="none"/>
      </svg>`,

  /* Frame 2: single filled rectangle (default board) */
  2: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect class="board-fill" x="2.5" y="3.5" width="15" height="13" rx="2"
              fill="rgba(27,58,107,0.55)"/>
      </svg>`,

  /* Frame 3: two panels – left filled, right outlined */
  3: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect class="board-fill"    x="1.5"  y="3.5" width="7.5" height="13" rx="2"
              fill="rgba(27,58,107,0.55)"/>
        <rect class="board-outline" x="11"   y="3.5" width="7.5" height="13" rx="2"
              stroke="rgba(27,58,107,0.55)" stroke-width="1.5" fill="none"/>
      </svg>`,

  /* Frame 4: two panels – both filled, slightly different shade */
  4: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect class="board-fill" x="1.5" y="3.5" width="7.5" height="13" rx="2"
              fill="rgba(27,58,107,0.55)"/>
        <rect class="board-fill" x="11"  y="3.5" width="7.5" height="13" rx="2"
              fill="rgba(27,58,107,0.3)"/>
      </svg>`,
};

/* ── FrameManager ──────────────────────────────────────────── */
const FrameManager = {
  _current: 2,

  init() {
    document.body.classList.add(`frame--${this._current}`);
    this._buildSwitcher();
  },

  switchTo(id) {
    if (!FRAMES[id] || id === this._current) return;
    document.body.classList.replace(`frame--${this._current}`, `frame--${id}`);
    this._current = id;
    this._updateButtons();
  },

  _updateButtons() {
    document.querySelectorAll('.frame-btn').forEach(btn => {
      const active = +btn.dataset.frame === this._current;
      btn.classList.toggle('frame-btn--active', active);
      btn.setAttribute('aria-pressed', String(active));
    });
  },

  _buildSwitcher() {
    const host = document.getElementById('frame-switcher');
    if (!host) return;

    Object.values(FRAMES).forEach(f => {
      const btn = document.createElement('button');
      btn.className = 'frame-btn' + (f.id === this._current ? ' frame-btn--active' : '');
      btn.dataset.frame = String(f.id);
      btn.title = `Frame ${f.id}: ${f.title}`;
      btn.setAttribute('aria-pressed', String(f.id === this._current));
      btn.innerHTML = FRAME_ICONS[f.id] || String(f.id);
      btn.addEventListener('click', () => this.switchTo(f.id));
      host.appendChild(btn);
    });
  },
};

document.addEventListener('DOMContentLoaded', () => FrameManager.init());
