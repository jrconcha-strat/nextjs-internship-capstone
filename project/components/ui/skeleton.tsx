"use client";
import { FC } from "react";

type SkeletonProps = {
  className: string; // Allow dynamic class names to adjust size and shape
};

export const Skeleton: FC<SkeletonProps> = ({ className }) => {
  return <div className={`${className} bg-gray-300 dark:bg-gray-600 animate-pulse`} />;
};
