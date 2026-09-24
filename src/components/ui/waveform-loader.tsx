import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

type WaveformLoaderProps = {
  className?: string;
};

export const WaveformLoader = ({ className }: WaveformLoaderProps) => (
  <div className={cn("flex items-center space-x-0.5 h-8", className)}>
    {Array.from({ length: 8 }).map((_, i) => (
      <motion.div
        key={i}
        className="w-1 rounded-full bg-foreground"
        animate={{ height: [4, 24, 4] }}
        transition={{
          duration: 1,
          repeat: Infinity,
          delay: Math.sin(i) * 0.5,
          ease: "easeInOut",
        }}
      />
    ))}
  </div>
);

export default WaveformLoader;
