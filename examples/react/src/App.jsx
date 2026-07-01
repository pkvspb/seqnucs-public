import { useEffect, useRef, useState } from 'react';
import { getPeaksNamesAsync, getPeaksQualitiesAsync } from '../../../api/mockSeqProcessedValues.js';
import SeqNucsComponent, { LIGHT_COLORS, DARK_COLORS } from './SeqNucsComponent.jsx';

function detectSystemTheme() {
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

const LEGEND_ITEMS = [
    { key: 'low',      label: 'Low quality (Q < 8)' },
    { key: 'med',      label: 'Medium quality (8 ≤ Q < 16)' },
    { key: 'high',     label: 'High quality (Q ≥ 16)' },
    { key: 'mutation', label: 'Mutation (ambiguity code)' },
];

function Legend({ theme }) {
    const colors = theme === 'dark' ? DARK_COLORS : LIGHT_COLORS;
    return (
        <>
            <div className="legend-title">Color legend</div>
            {LEGEND_ITEMS.map(({ key, label }) => (
                <div className="legend-item" key={key}>
                    <span className="legend-swatch" style={{ background: colors[key] }} />
                    <span>{label}</span>
                </div>
            ))}
        </>
    );
}

// Set before the first render so SeqNucsComponent's effect (which runs
// before App's effects) reads the correct theme's CSS variables.
document.documentElement.dataset.appliedMode = detectSystemTheme();

export default function App() {
    const [theme, setTheme] = useState(detectSystemTheme);
    const [peaks, setPeaks] = useState(null);
    const [status, setStatus] = useState('No selection');

    const leftResizerRef = useRef(null);

    // Resizable left panel — demonstrates the viewer adapting to container resizes.
    useEffect(() => {
        const resizer = leftResizerRef.current;
        if (!resizer) return;
        let dragging = false;
        let rafId = null;

        function onMouseDown(e) {
            e.preventDefault();
            dragging = true;
            resizer.classList.add('active');
            document.body.style.userSelect = 'none';
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        }

        function onMouseMove(e) {
            if (!dragging) return;
            const pct = Math.min(Math.max((e.clientX / window.innerWidth) * 100, 10), 70);
            if (rafId) cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => {
                rafId = null;
                document.documentElement.style.setProperty('--left-width', pct + '%');
            });
        }

        function onMouseUp() {
            dragging = false;
            resizer.classList.remove('active');
            document.body.style.userSelect = '';
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        }

        resizer.addEventListener('mousedown', onMouseDown);
        return () => {
            resizer.removeEventListener('mousedown', onMouseDown);
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };
    }, []);

    // Load mock peak data once.
    useEffect(() => {
        let cancelled = false;
        (async () => {
            const [names, qualities] = await Promise.all([
                getPeaksNamesAsync(),
                getPeaksQualitiesAsync(),
            ]);
            if (cancelled) return;
            setPeaks(names.map((nuc, i) => ({ nuc, number: i + 1, quality: qualities[i] })));
        })();
        return () => { cancelled = true; };
    }, []);

    function toggleTheme() {
        const next = theme === 'dark' ? 'light' : 'dark';
        // Synchronous update so SeqNucsComponent's effect reads the correct
        // CSS variables before React re-renders.
        document.documentElement.dataset.appliedMode = next;
        setTheme(next);
    }

    function onSelectionChanged(lo, hi) {
        setStatus(`Selected: ${lo + 1}–${hi + 1}  (${hi - lo + 1} positions)`);
    }

    return (
        <>
            <div className="left" id="left-id">
                <Legend theme={theme} />
            </div>
            <div ref={leftResizerRef} className="left-resizer"></div>

            <div className="main">
                <div className="toolbar">
                    <span className="toolbar-title">SeqNucs</span>
                    <button
                        onClick={toggleTheme}
                        style={{fontSize: "12px"}}
                    >
                        {theme === 'dark' ? '☀️' : '🌙'}
                    </button>
                </div>

                {peaks && (
                    <SeqNucsComponent
                        peaks={peaks}
                        theme={theme}
                        onSelectionChanged={onSelectionChanged}
                    />
                )}

                <div className="status-bar">{status}</div>
            </div>
        </>
    );
}
