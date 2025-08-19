"use client";
import { FC } from "react";

type SkeletonProps = {
  height: string;
  width: string;
  className?: string;
};

export const Skeleton: FC<SkeletonProps> = ({ height, width, className }) => {
  return <div className={`${className} h-${height} w-${width} bg-white-smoke-200 rounded-md animate-pulse`} />;
};
