import { ChangeEvent, FC } from "react";

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

export {LastNameField, FirstNameField}