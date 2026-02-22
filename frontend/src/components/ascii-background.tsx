import { useEffect, useRef, useState } from "react";

interface Spore {
    x: number;
    y: number;
    speed: number;
    char: string;
    wobbleSpeed: number;
    wobbleOffset: number;
}

export const AsciiBackground = () => {
    const [ascii, setAscii] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let animationId: number = 0;

        // Fixed grid constraints
        const cols = 120;
        const rows = 40;

        // Initialize spores
        const numSpores = 60; // Sparse distribution
        const spores: Spore[] = Array.from({ length: numSpores }, () => ({
            x: Math.random() * cols,
            y: Math.random() * rows,
            speed: 0.1 + Math.random() * 0.3,
            char: Math.random() > 0.8 ? "o" : Math.random() > 0.5 ? "." : "+",
            wobbleSpeed: 0.5 + Math.random() * 2,
            wobbleOffset: Math.random() * Math.PI * 2
        }));

        let lastRender = 0;

        const renderFrame = (now: number) => {
            // ~15 FPS
            if (now - lastRender < 66) {
                animationId = window.requestAnimationFrame(renderFrame);
                return;
            }
            lastRender = now;

            const t = now / 1000;

            // Create empty grid
            const grid: string[][] = Array(rows).fill(null).map(() => Array(cols).fill(" "));

            // Update and draw spores
            for (const spore of spores) {
                // Move up
                spore.y -= spore.speed;
                if (spore.y < 0) {
                    spore.y = rows - 1;
                    spore.x = Math.random() * cols;
                }

                // Wobble side to side
                const currentX = Math.floor(spore.x + Math.sin(t * spore.wobbleSpeed + spore.wobbleOffset) * 2);
                const currentY = Math.floor(spore.y);

                if (currentX >= 0 && currentX < cols && currentY >= 0 && currentY < rows) {
                    grid[currentY][currentX] = spore.char;
                }
            }

            // Convert to string
            let gridStr = "";
            for (let y = 0; y < rows; y++) {
                gridStr += grid[y].join("") + "\n";
            }

            setAscii(gridStr);
            // @ts-ignore
            animationId = requestAnimationFrame(renderFrame);
        };

        // @ts-ignore
        animationId = requestAnimationFrame(renderFrame);

        // @ts-ignore
        return () => cancelAnimationFrame(animationId);
    }, []);

    return (
        <div
            ref={containerRef}
            className="absolute inset-0 overflow-hidden flex items-center justify-center opacity-[0.08] dark:opacity-[0.15] pointer-events-none select-none z-[-1]"
        >
            <pre
                className="text-[10px] sm:text-[12px] leading-[1.1] font-mono whitespace-pre text-foreground font-bold"
                style={{ letterSpacing: "0.15em" }}
            >
                {ascii}
            </pre>
        </div>
    );
};
