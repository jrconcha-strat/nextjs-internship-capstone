import { FC } from "react";


const ProfileSettingsSkeleton: FC = () => {
  return (
    <div className="lg:col-span-2 bg-white dark:bg-outer_space-500 rounded-lg border border-french_gray-300 dark:border-payne's_gray-400 p-6">
      <div className="bg-(--white-smoke-100) h-7 w-36 rounded-xl mb-6"></div>

      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <div className="bg-(--white-smoke-100) h-4 w-16 rounded-xl"></div>

          <div className="bg-(--white-smoke-100) h-10 w-full rounded-xl"></div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="bg-(--white-smoke-100) h-4 w-16 rounded-xl"></div>

          <div className="bg-(--white-smoke-100) h-10 w-full rounded-xl"></div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="bg-(--white-smoke-100) h-4 w-16 rounded-xl"></div>

          <div className="bg-(--white-smoke-100) h-10 w-full rounded-xl"></div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="bg-(--white-smoke-100) h-4 w-16 rounded-xl"></div>

          <div className="bg-(--white-smoke-100) h-10 w-full rounded-xl"></div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <div className="bg-(--white-smoke-100) h-8 w-32 rounded-xl"></div>
          <div className="bg-(--white-smoke-100) h-8 w-32 rounded-xl"></div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettingsSkeleton;