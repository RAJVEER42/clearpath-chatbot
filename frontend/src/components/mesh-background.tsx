import { motion } from "framer-motion";

export const MeshBackground = () => {
    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-10] bg-background transition-colors duration-700">
            {/* 
        We use framer-motion to create slow, drifting gradient orbs 
        that blend together via CSS blur & mix-blend-mode. 
      */}
            <div className="absolute inset-0 opacity-40 mix-blend-multiply dark:mix-blend-screen">
                <motion.div
                    className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] rounded-full bg-black/[0.03] dark:bg-white/[0.02] blur-[100px]"
                    animate={{
                        x: ["0%", "10%", "-5%", "0%"],
                        y: ["0%", "5%", "15%", "0%"],
                        scale: [1, 1.1, 0.9, 1],
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute top-[20%] -right-[10%] w-[50%] h-[70%] rounded-full bg-black/[0.02] dark:bg-white/[0.015] blur-[120px]"
                    animate={{
                        x: ["0%", "-15%", "5%", "0%"],
                        y: ["0%", "10%", "-10%", "0%"],
                        scale: [1, 0.9, 1.2, 1],
                    }}
                    transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                />
                <motion.div
                    className="absolute -bottom-[20%] left-[20%] w-[70%] h-[60%] rounded-full bg-black/[0.04] dark:bg-white/[0.01] blur-[120px]"
                    animate={{
                        x: ["0%", "20%", "-10%", "0%"],
                        y: ["0%", "-15%", "5%", "0%"],
                        scale: [1, 1.15, 0.85, 1],
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 4 }}
                />
            </div>

            {/* Subtle noise texture overlay for a physical glass feel */}
            <div
                className="absolute inset-0 opacity-20 dark:opacity-10 mix-blend-overlay pointer-events-none"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                }}
            />
        </div>
    );
};
