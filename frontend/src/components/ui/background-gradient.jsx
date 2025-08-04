"use client";
import { cn } from "@/lib/utils";
import React from "react";
import { motion } from "framer-motion";
import PropTypes from "prop-types"; // Import PropTypes for type checking in JS

// Define the component using standard JavaScript function syntax
export const BackgroundGradient = ({
  children,
  className,
  containerClassName,
  animate = true,
}) => {
  const variants = {
    initial: {
      backgroundPosition: "0 50%",
    },
    animate: {
      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
    },
  };
  return (
    <div className={cn("relative p-[4px] group", containerClassName)}>
      <motion.div
        variants={animate ? variants : undefined}
        initial={animate ? "initial" : undefined}
        animate={animate ? "animate" : undefined}
        transition={
          animate
            ? {
                duration: 5,
                repeat: Infinity,
                repeatType: "reverse",
              }
            : undefined
        }
        style={{
          backgroundSize: animate ? "400% 400%" : undefined,
        }}
        className={cn(
          "absolute inset-0 rounded-3xl z-[1] opacity-60 group-hover:opacity-100 blur-xl transition duration-500 will-change-transform",
          // Green theme gradient
          "bg-[radial-gradient(circle_farthest-side_at_0_100%,#34D399,transparent),radial-gradient(circle_farthest-side_at_100%_0,#A7F3D0,transparent),radial-gradient(circle_farthest-side_at_100%_100%,#FDE047,transparent),radial-gradient(circle_farthest-side_at_0_0,#10B981,#141316)]"
        )}
      />
      <motion.div
        variants={animate ? variants : undefined}
        initial={animate ? "initial" : undefined}
        animate={animate ? "animate" : undefined}
        transition={
          animate
            ? {
                duration: 5,
                repeat: Infinity,
                repeatType: "reverse",
              }
            : undefined
        }
        style={{
          backgroundSize: animate ? "400% 400%" : undefined,
        }}
        className={cn(
          "absolute inset-0 rounded-3xl z-[1] will-change-transform",
          // Green theme gradient
          "bg-[radial-gradient(circle_farthest-side_at_0_100%,#34D399,transparent),radial-gradient(circle_farthest-side_at_100%_0,#A7F3D0,transparent),radial-gradient(circle_farthest-side_at_100%_100%,#FDE047,transparent),radial-gradient(circle_farthest-side_at_0_0,#10B981,#141316)]"
        )}
      />
      <div className={cn("relative z-10", className)}>{children}</div>
    </div>
  );
};

// Add prop-types for type checking in JavaScript
BackgroundGradient.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  containerClassName: PropTypes.string,
  animate: PropTypes.bool,
};
