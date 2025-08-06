"use client"

import React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export const BackgroundGradient = ({
  children,
  className,
  containerClassName,
  animate = true,
}: {
  children?: React.ReactNode
  className?: string
  containerClassName?: string
  animate?: boolean
}) => {
  const variants = {
    initial: {
      backgroundPosition: "0 50%",
    },
    animate: {
      backgroundPosition: ["0, 50%", "100% 50%", "0 50%"],
    },
  }
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
          "absolute inset-0 rounded-3xl z-[1] opacity-60 group-hover:opacity-100 blur-xl  transition duration-500 will-change-transform",
          " bg-[radial-gradient(circle_farthest-side_at_0_100%,#60a5fa,transparent),radial-gradient(circle_farthest-side_at_100%_0,#a78bfa,transparent),radial-gradient(circle_farthest-side_at_100%_100%,#fbbf24,transparent),radial-gradient(circle_farthest-side_at_0_0,#3b82f6,#f8fafc)]"
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
          "absolute inset-0 rounded-3xl z-[1]",
          "bg-[radial-gradient(circle_farthest-side_at_0_100%,#60a5fa,transparent),radial-gradient(circle_farthest-side_at_100%_0,#a78bfa,transparent),radial-gradient(circle_farthest-side_at_100%_100%,#fbbf24,transparent),radial-gradient(circle_farthest-side_at_0_0,#3b82f6,#f8fafc)]"
        )}
      />

      <div className={cn("relative z-10", className)}>{children}</div>
    </div>
  )
}

export const HoverEffect = ({
  items,
  className,
}: {
  items: {
    title: string
    description: string
    icon?: React.ReactNode
    value?: string | number
  }[]
  className?: string
}) => {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null)

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", className)}>
      {items.map((item, idx) => (
        <div
          key={idx}
          className="relative group block p-2 h-full w-full"
          onMouseEnter={() => setHoveredIndex(idx)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <motion.span
            className="absolute inset-0 h-full w-full bg-gradient-to-r from-blue-100 via-purple-100 to-indigo-100 block rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            layoutId="hoverBackground"
            initial={{ opacity: 0 }}
            animate={{
              opacity: hoveredIndex === idx ? 0.8 : 0,
            }}
            transition={{
              duration: 0.15,
            }}
          />
          <div className="rounded-2xl h-full w-full p-4 overflow-hidden bg-white/90 backdrop-blur-sm border border-slate-200 group-hover:border-blue-300 relative z-20 shadow-lg group-hover:shadow-xl transition-all duration-200">
            <div className="relative z-50">
              <div className="p-4">
                <div className="flex items-center space-x-3">
                  {item.icon && (
                    <div className="p-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg">
                      {item.icon}
                    </div>
                  )}
                  <div>
                    <h4 className="text-slate-700 font-bold tracking-wide">
                      {item.title}
                    </h4>
                    {item.value && (
                      <p className="text-2xl font-bold text-slate-900 mt-2">
                        {item.value}
                      </p>
                    )}
                    <p className="mt-2 text-slate-600 tracking-wide leading-relaxed text-sm">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export const AnimatedBeam = ({
  className,
  reverse = false,
  duration = 5,
}: {
  className?: string
  reverse?: boolean
  duration?: number
}) => {
  return (
    <motion.div
      className={cn(
        "absolute inset-0 h-full w-full",
        "bg-gradient-to-r from-transparent via-blue-500 to-transparent",
        className
      )}
      initial={{ x: reverse ? "100%" : "-100%" }}
      animate={{ x: reverse ? "-100%" : "100%" }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "linear",
      }}
    />
  )
}

export const Spotlight = ({
  className,
  fill = "#3b82f6",
}: {
  className?: string
  fill?: string
}) => {
  return (
    <svg
      className={cn(
        "animate-pulse animate-duration-[3s] pointer-events-none absolute z-[1] h-[169%] w-[138%] lg:w-[84%] opacity-0",
        className
      )}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 3787 2842"
      fill="none"
    >
      <g filter="url(#filter)">
        <ellipse
          cx="1924.71"
          cy="273.501"
          rx="1924.71"
          ry="273.501"
          transform="matrix(-0.822377 -0.568943 -0.568943 0.822377 3631.88 2291.09)"
          fill={fill}
          fillOpacity="0.21"
        ></ellipse>
      </g>
      <defs>
        <filter
          id="filter"
          x="0.860352"
          y="0.838989"
          width="3785.16"
          height="2840.26"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix"></feFlood>
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          ></feBlend>
          <feGaussianBlur
            stdDeviation="151"
            result="effect1_foregroundBlur_1065_8"
          ></feGaussianBlur>
        </filter>
      </defs>
    </svg>
  )
}

export const FloatingCard = ({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
      className={cn(
        "bg-white rounded-2xl border border-slate-200 hover:border-green-300 hover:shadow-xl transition-all duration-300 overflow-hidden",
        className
      )}
    >
      {children}
    </motion.div>
  )
}

export const GradientText = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => {
  return (
    <span
      className={cn(
        "bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent font-bold",
        className
      )}
    >
      {children}
    </span>
  )
}

export const AnimatedCounter = ({
  value,
  suffix = "",
  duration = 2,
  className,
}: {
  value: number
  suffix?: string
  duration?: number
  className?: string
}) => {
  const [count, setCount] = React.useState(0)
  const [isInView, setIsInView] = React.useState(false)

  React.useEffect(() => {
    if (isInView) {
      let start = 0
      const end = value
      const increment = end / (duration * 60)

      const timer = setInterval(() => {
        start += increment
        if (start >= end) {
          setCount(end)
          clearInterval(timer)
        } else {
          setCount(Math.floor(start))
        }
      }, 1000 / 60)

      return () => clearInterval(timer)
    }
  }, [isInView, value, duration])

  return (
    <motion.span
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      onViewportEnter={() => setIsInView(true)}
      className={cn("font-bold", className)}
    >
      {count.toLocaleString()}
      {suffix}
    </motion.span>
  )
}

export const FeatureCard = ({
  icon: Icon,
  title,
  description,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  className?: string
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={cn(
        "group relative bg-white rounded-xl p-6 border border-slate-200 hover:border-green-300 transition-all duration-300 hover:shadow-lg",
        className
      )}
    >
      <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-100 transition-colors duration-300">
        <Icon className="w-6 h-6 text-green-600" />
      </div>
      <h3 className="text-lg font-semibold text-slate-800 mb-2 group-hover:text-green-700 transition-colors duration-300">
        {title}
      </h3>
      <p className="text-slate-600 text-sm leading-relaxed">
        {description}
      </p>
    </motion.div>
  )
}
