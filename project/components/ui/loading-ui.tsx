import { Loader2Icon } from "lucide-react";
import { FC } from "react";

const LoadingUI: FC = () => {
  return (
    <div className="w-full h-[100vh] flex justify-center items-center gap-x-2">
      {" "}
      <Loader2Icon size={24} className="animate-spin"></Loader2Icon>{" "}
      <p className="text-2xl"> Loading </p>
    </div>
  );
};

export default LoadingUI;
