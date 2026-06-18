import { useEffect, useRef } from 'react';
import { initSeqNucs } from '../../../lib/seqnucs.js';

export const LIGHT_COLORS = {
    low:       '#F8C9B9',
    med:       '#F9E7A8',
    high:      '#BFD7FF',
    mutation:  '#D9BEA3',
    text:      '#000',
    numText:   '#111',
    selection: '#fff',
};

export const DARK_COLORS = {
    low:       '#FF4500',   //'OrangeRed',
    med:       '#FFD700',   //'Gold',
    high:      '#6495ED',   //'CornflowerBlue',
    mutation:  '#A0522D',   //'Sienna',
    text:      '#000',
    numText:   '#aaa',
    selection: '#fff',
};

export default function SeqNucsComponent({ peaks, theme, onSelectionChanged }) {
    const containerRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const { unInit } = initSeqNucs(container.id, peaks, LIGHT_COLORS, DARK_COLORS, onSelectionChanged);

        return () => unInit();
        // eslint-disable-next-line react-hooks/exhaustive-deps -- peaks identity is stable; theme triggers re-init for color update
    }, [peaks, theme]);

    return (
        <div
            ref={containerRef}
            id="seqnucs-container-id"
            className="nucs-container"
        />
    );
}
