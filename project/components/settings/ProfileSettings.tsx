"use client";
import { useUser } from "@clerk/nextjs";
import { type UserResource } from "@clerk/types";
import { Loader2Icon } from "lucide-react";
import { FC, useState, useEffect, ChangeEvent, Fragment } from "react";

const ProfileSettings: FC = () => {
  // Retrieve Current User Data.
  const { isLoaded, user } = useUser();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const setDefault = (user: UserResource) => {
    if (user.firstName && user.lastName && user.primaryEmailAddress) {
      setFirstName(user.firstName);
      setLastName(user.lastName);
      // Get the primary email address of the user.
      setEmail(user.primaryEmailAddress.emailAddress);
    }
  };

  const handleFirstNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFirstName(e.target.value);
  };

  const handleLastNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setLastName(e.target.value);
  };

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  useEffect(() => {
    if (user) {
      setDefault(user);
    }
  }, [user]);

  // If cancel button was clicked, discard any working changes.
  const handleCancel = () => {
    if (user) {
      setDefault(user);
    }
  };

  // Update the user with the news fields.
  const handleSubmit = async () => {
    setIsLoading(true);
    if (!user) return null;

    try {
      await user.update({
        firstName: firstName,
        lastName: lastName,
      });
    } catch (e) {
      console.log(`Error saving profile settings changes: ${e}`);
    }
    setIsLoading(false);
  };

  if (!isLoaded) {
    return <ProfileSettingsSkeleton></ProfileSettingsSkeleton>;
  }

  return (
    <div className="lg:col-span-2 bg-white dark:bg-outer_space-500 rounded-lg border border-french_gray-300 dark:border-payne's_gray-400 p-6">
      <h3 className="text-lg font-semibold text-outer_space-500 dark:text-platinum-500 mb-6">
        Profile Settings
      </h3>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-outer_space-500 dark:text-platinum-500 mb-2">
            First Name
          </label>
          <input
            type="text"
            placeholder="John"
            value={firstName}
            onChange={handleFirstNameChange}
            disabled={isLoading}
            className="w-full px-3 py-2 border border-french_gray-300 dark:border-payne's_gray-400 rounded-lg bg-white dark:bg-outer_space-400 text-outer_space-500 dark:text-platinum-500 focus:outline-hidden focus:ring-2 focus:ring-blue_munsell-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-outer_space-500 dark:text-platinum-500 mb-2">
            Last Name
          </label>
          <input
            type="text"
            placeholder="Doe"
            value={lastName}
            disabled={isLoading}
            onChange={handleLastNameChange}
            className="w-full px-3 py-2 border border-french_gray-300 dark:border-payne's_gray-400 rounded-lg bg-white dark:bg-outer_space-400 text-outer_space-500 dark:text-platinum-500 focus:outline-hidden focus:ring-2 focus:ring-blue_munsell-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-outer_space-500 dark:text-platinum-500 mb-2">
            Email Address
          </label>
          <input
            type="email"
            placeholder="john@example.com"
            value={email}
            disabled={isLoading}
            onChange={handleEmailChange}
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

        <div className="flex justify-end gap-x-3 pt-4">
          <button
            disabled={isLoading}
            onClick={handleCancel}
            className="px-4 py-2 text-payne's_gray-500 dark:text-french_gray-400 hover:bg-platinum-500 dark:hover:bg-payne's_gray-400 rounded-lg transition-colors"
          >
            {isLoading ? (
              <Fragment>
                <Loader2Icon /> <p>Loading...</p>{" "}
              </Fragment>
            ) : (
              "Cancel"
            )}
          </button>
          <button
            disabled={isLoading}
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue_munsell-500 text-white rounded-lg hover:bg-blue_munsell-600 transition-colors"
          >
            {isLoading ? (
              <Fragment>
                <Loader2Icon /> <p>Loading...</p>{" "}
              </Fragment>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

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

export default ProfileSettings;
