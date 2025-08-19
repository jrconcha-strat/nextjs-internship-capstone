import { Loader2Icon } from "lucide-react";

export default function Loading() {
  <div className="w-full h-full flex justify-center items-center gap-x-2">
    {" "}
    <Loader2Icon size={24} className="animate-spin"></Loader2Icon> <p className="text-2xl"> Loading </p>
  </div>;
}
