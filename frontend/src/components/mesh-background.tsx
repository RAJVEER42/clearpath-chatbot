export const MeshBackground = () => {
    return (
        <div className="fixed inset-0 min-h-screen w-full overflow-hidden -z-50 pointer-events-none transition-colors duration-500">
            {/* 
                Diagonal Base Gradient matching the provided image: 
                Top-left is bright white/icy blue, sweeping sharply to deep dark navy/black.
                Light mode keeps the icy feel but significantly brightened globally.
            */}
            <div className="absolute inset-0 dark:bg-[linear-gradient(125deg,#f8fafc_0%,#0ea5e9_30%,#0f172a_55%,#000000_100%)] bg-[linear-gradient(125deg,#ffffff_0%,#f0f9ff_40%,#bae6fd_80%,#7dd3fc_100%)]" />

            {/* Halftone Pattern Dot Grid Array */}
            <div
                className="absolute inset-0 text-slate-800 dark:text-slate-200 opacity-[0.08] dark:opacity-[0.12] mix-blend-multiply dark:mix-blend-screen"
                style={{
                    backgroundImage: 'radial-gradient(circle, currentColor 1.5px, transparent 1.5px)',
                    backgroundSize: '6px 6px'
                }}
            />

            {/* Subtle Noise Texture for physical rendering */}
            <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay"
                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}
            />

            {/* Bottom Fade Mask to ground UI elements in background color */}
            <div className="absolute bottom-0 inset-x-0 h-1/3 bg-gradient-to-t from-background to-transparent z-10" />
        </div>
    );
};
