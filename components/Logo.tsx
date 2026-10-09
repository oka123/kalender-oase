import React from "react";
import Image from "next/image";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl" | number;
  className?: string;
  priority?: boolean;
}

export function Logo({
  size = "md",
  className = "",
  priority = false,
}: LogoProps) {
  // Hitung dimensi berdasarkan ukuran
  let dimension = 40;
  if (typeof size === "number") {
    dimension = size;
  } else {
    switch (size) {
      case "sm":
        dimension = 32;
        break;
      case "md":
        dimension = 40;
        break;
      case "lg":
        dimension = 56;
        break;
      case "xl":
        dimension = 80;
        break;
    }
  }

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 overflow-hidden rounded-xl ${className}`}
      style={{ width: dimension, height: dimension }}
    >
      <Image
        src="/logo.webp"
        alt="Logo Kalender OASE Universitas Udayana"
        width={dimension}
        height={dimension}
        priority={priority}
        className="w-full h-full object-contain"
      />
    </div>
  );
}
