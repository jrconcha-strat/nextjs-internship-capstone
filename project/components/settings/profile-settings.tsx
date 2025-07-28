"use client";
import { useUser } from "@clerk/nextjs";
import { type UserResource } from "@clerk/types";
import { Loader2Icon } from "lucide-react";
import {
  FC,
  useState,
  useEffect,
  useContext,
  createContext,
  ChangeEvent,
  Dispatch,
  SetStateAction,
} from "react";
import { toast } from "sonner";
import Image from "next/image";
import ProfileSettingsSkeleton from "./profile-settings-skeleton";

interface ProfileContextType {
  user: UserResource | null;
  email: string;
  setIsAlreadyEditing: Dispatch<SetStateAction<boolean>>;
  isAlreadyEditing: boolean;
  isLoading: boolean;
}

const ProfileContext = createContext<ProfileContextType>({
  user: null,
  email: "",
  setIsAlreadyEditing: () => {},
  isAlreadyEditing: false,
  isLoading: false,
});

const ProfileSettings: FC = () => {
  // Retrieve Current User Data.
  const { isLoaded, user } = useUser();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAlreadyEditing, setIsAlreadyEditing] = useState(false);

  useEffect(() => {
    if (user && user.primaryEmailAddress)
      setEmail(user.primaryEmailAddress.emailAddress);
  }, [user]);
  if (!isLoaded) {
    return <ProfileSettingsSkeleton/>;
  }

  return (
    <ProfileContext.Provider
      value={{
        user,
        email,
        setIsAlreadyEditing,
        isAlreadyEditing,
        isLoading,
      }}
    >
      <div className="lg:col-span-2 bg-white dark:bg-outer_space-500 rounded-lg border border-french_gray-300 dark:border-payne's_gray-400 p-6">
        <h3 className="text-lg font-semibold text-outer_space-500 dark:text-platinum-500 mb-6">
          Profile Settings
        </h3>

        <div className="space-y-6">
          <ProfileDetailsSection/>

          <div>
            <label className="block text-sm font-medium text-outer_space-500 dark:text-platinum-500 mb-2">
              Email Address
            </label>
            <input
              type="email"
              placeholder="john@example.com"
              value={email}
              disabled={isLoading}
              onChange={() => {}}
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
              onClick={() => {}}
              className="px-4 py-2 text-payne's_gray-500 dark:text-french_gray-400 hover:bg-platinum-500 dark:hover:bg-payne's_gray-400 rounded-lg transition-colors"
            >
              {isLoading ? (
                <div className="flex">
                  <Loader2Icon /> <p>Loading...</p>{" "}
                </div>
              ) : (
                "Cancel"
              )}
            </button>
            <button
              disabled={isLoading}
              onClick={() => {}}
              className="px-4 py-2 bg-blue_munsell-500 text-white rounded-lg hover:bg-blue_munsell-600 transition-colors"
            >
              {isLoading ? (
                <div className="flex">
                  <Loader2Icon /> <p>Loading...</p>{" "}
                </div>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </div>
      </div>
    </ProfileContext.Provider>
  );
};

const ProfileDetailsSection: FC = () => {
  const { user } = useContext(ProfileContext);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSaveLoading, setIsSaveLoading] = useState(false);

  const handleFirstNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFirstName(e.target.value);
  };

  const handleLastNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setLastName(e.target.value);
  };

  const setDefault = (user: UserResource) => {
    if (user.firstName && user.lastName) {
      setFirstName(user.firstName);
      setLastName(user.lastName);
    }
  };

  useEffect(() => {
    if (user) {
      setDefault(user);
      console.log(user);
    }
  }, [user]);

  const handleCancel = () => {
    setIsUpdating(false);
    if (user && user.firstName && user.lastName) {
      setFirstName(user.firstName);
      setLastName(user.lastName);
    }
  };

  // Update the user with the new data
  const handleSave = async () => {
    setIsSaveLoading(true);
    if (!user) return null;

    try {
      // Check if any modifications has happened before trying to update the names.
      if (user.firstName !== firstName || user.lastName !== lastName) {
        // Update Name Fields
        await user.update({
          firstName: firstName,
          lastName: lastName,
        });
        toast.success("Success", {
          description: `Changes saved.`,
          action: { label: "Dismiss", onClick: () => {} },
        });
      }
    } catch (e) {
      toast.error("Unable to save changes", {
        description: `Reason: ${e}`,
        action: { label: "Dismiss", onClick: () => {} },
      });
    }
    setIsUpdating(false);
    setIsSaveLoading(false);
  };

  if (!user) return null;

  return (
    <div className="lg:grid grid-cols-3">
      <div className="mb-3 lg:mb-0 col-span-1 flex items-center">
        <p className="text-sm font-medium text-(--text-primary)"> Profile </p>
      </div>
      <div className="col-span-2">
        <div className="md:flex items-center justify-between">
          <div className="mb-3 lg:mb-0 flex items-center gap-2">
            <div className="relative w-[48px] h-[48px] lg:w-[64px] lg:h-[64px]">
              {user.imageUrl && (
                <Image
                  src={user.imageUrl}
                  alt="Profile Avatar of the User"
                  width={64}
                  height={64}
                  className="rounded-full"
                />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-(--text-primary)">
                {" "}
                Your Full Name
              </p>
              <p className="text-sm font-normal text-(--text-secondary)">
                {user.fullName}
              </p>
            </div>
          </div>

          {isUpdating ? (
            <div className="flex gap-2 justify-end">
              <button
                onClick={handleCancel}
                className={`${isSaveLoading ? "text-(--disabled-button-text-secondary)" : ""} text-xs rounded-sm p-2 bg-(--button-color-secondary) hover:bg-(--button-hover-color-secondary) transition-colors duration-150 font-semibold text-(--button-text-secondary)`}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaveLoading}
                className="text-xs rounded-sm p-2 bg-(--button-color) hover:bg-(--button-hover-color) transition-colors duration-150 font-semibold text-(--button-text)"
              >
                {isSaveLoading ? (
                  <div className="flex gap-2">
                    <Loader2Icon size={16} className="animate-spin" />{" "}
                    <p className="text-xs rounded-sm font-semibold text-(--button-text)">
                      Loading...
                    </p>{" "}
                  </div>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          ) : (
            <div className="flex justify-end">
              {" "}
              <button
                onClick={() => setIsUpdating(!isUpdating)}
                className="text-xs rounded-sm p-2 bg-(--button-color) hover:bg-(--button-hover-color) transition-colors duration-150 font-semibold text-(--white-smoke-50)"
              >
                {" "}
                Update Your Profile{" "}
              </button>
            </div>
          )}
        </div>
        <div
          className={`transition-all duration-300 ${
            isUpdating
              ? "opacity-100 max-h-[600px]"
              : "opacity-0 max-h-0 overflow-hidden"
          }`}
        >
          <div className="flex mt-5 gap-2 w-full">
            <FirstNameField
              firstName={firstName}
              handleFirstNameChange={handleFirstNameChange}
            ></FirstNameField>
            <LastNameField
              lastName={lastName}
              handleLastNameChange={handleLastNameChange}
            ></LastNameField>
          </div>
        </div>
      </div>
    </div>
  );
};

const FirstNameField: FC<{
  firstName: string;
  handleFirstNameChange: (e: ChangeEvent<HTMLInputElement>) => void;
}> = ({ firstName, handleFirstNameChange }) => {
  return (
    <div className="w-full">
      <label className="block text-sm font-normal text-(--text-secondary) mb-2">
        First Name
      </label>
      <div className="relative flex">
        <input
          type="text"
          placeholder="John"
          value={firstName}
          onChange={handleFirstNameChange}
          className={`bg-(--input-bg) text-(--input-text) w-full px-3 py-2 border border-french_gray-300 dark:border-payne's_gray-400 rounded-lg not-only-of-type:focus:outline-hidden focus:ring-2 focus:ring-blue_munsell-500`}
        />
      </div>
    </div>
  );
};

const LastNameField: FC<{
  lastName: string;
  handleLastNameChange: (e: ChangeEvent<HTMLInputElement>) => void;
}> = ({ lastName, handleLastNameChange }) => {
  return (
    <div className="w-full">
      <label className="block text-sm font-normal text-(--text-secondary) mb-2">
        Last Name
      </label>
      <div className="relative flex">
        <input
          type="text"
          placeholder="John"
          value={lastName}
          onChange={handleLastNameChange}
          className={`bg-(--input-bg) text-(--input-text) w-full px-3 py-2 border border-french_gray-300 dark:border-payne's_gray-400 rounded-lg not-only-of-type:focus:outline-hidden focus:ring-2 focus:ring-blue_munsell-500`}
        />
      </div>
    </div>
  );
};



export default ProfileSettings;
