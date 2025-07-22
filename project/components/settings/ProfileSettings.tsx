import { FC } from "react";

const ProfileSettings: FC = () => {
  return (
    <div className="lg:col-span-2 bg-white dark:bg-outer_space-500 rounded-lg border border-french_gray-300 dark:border-payne's_gray-400 p-6">
      <h3 className="text-lg font-semibold text-outer_space-500 dark:text-platinum-500 mb-6">
        Profile Settings
      </h3>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-outer_space-500 dark:text-platinum-500 mb-2">
            Full Name
          </label>
          <input
            type="text"
            defaultValue="John Doe"
            className="w-full px-3 py-2 border border-french_gray-300 dark:border-payne's_gray-400 rounded-lg bg-white dark:bg-outer_space-400 text-outer_space-500 dark:text-platinum-500 focus:outline-hidden focus:ring-2 focus:ring-blue_munsell-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-outer_space-500 dark:text-platinum-500 mb-2">
            Email Address
          </label>
          <input
            type="email"
            defaultValue="john@example.com"
            className="w-full px-3 py-2 border border-french_gray-300 dark:border-payne's_gray-400 rounded-lg bg-white dark:bg-outer_space-400 text-outer_space-500 dark:text-platinum-500 focus:outline-hidden focus:ring-2 focus:ring-blue_munsell-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-outer_space-500 dark:text-platinum-500 mb-2">
            Role
          </label>
          <select className="w-full px-3 py-2 border border-french_gray-300 dark:border-payne's_gray-400 rounded-lg bg-white dark:bg-outer_space-400 text-outer_space-500 dark:text-platinum-500 focus:outline-hidden focus:ring-2 focus:ring-blue_munsell-500">
            <option>Project Manager</option>
            <option>Developer</option>
            <option>Designer</option>
            <option>QA Engineer</option>
          </select>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button className="px-4 py-2 text-payne's_gray-500 dark:text-french_gray-400 hover:bg-platinum-500 dark:hover:bg-payne's_gray-400 rounded-lg transition-colors">
            Cancel
          </button>
          <button className="px-4 py-2 bg-blue_munsell-500 text-white rounded-lg hover:bg-blue_munsell-600 transition-colors">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
