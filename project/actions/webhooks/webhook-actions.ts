"use server";

import { DeletedObjectJSON, UserJSON } from "@clerk/backend";
import { UserInsert } from "@/types";
import { getUserPrimaryEmailAddress } from "./webhook-utils";
import { queries } from "@/lib/db/queries/queries";
import { userSchemaDB } from "@/lib/validations/validations";

export async function createUser(eventData: UserJSON) {
  try {
    const userClerkIdToBeInserted = eventData.id;

    const result = await queries.users.getByClerkId(userClerkIdToBeInserted);
    // Check if user exists.
    if (result.success) {
      return {
        success: false,
        message: `Webhook Action: User "${userClerkIdToBeInserted}" already exists in the database. Insertion aborted.`,
        error: `Error: Duplicate user "${userClerkIdToBeInserted}"`,
      };
    }

    // Construct the newUser object to be inserted.
    const emailResult = getUserPrimaryEmailAddress(eventData);

    // If an error is raised.
    if (!emailResult.success) {
      return emailResult;
    }

    const primary_email = emailResult.primaryEmailAddress;
    const name = `${eventData.first_name} ${eventData.last_name}`;

    const newUserData: UserInsert = {
      clerkId: userClerkIdToBeInserted,
      email: primary_email,
      name: name,
      image_url: eventData.image_url,
      createdAt: new Date(eventData.created_at), // Convert to UNIX timestamp (milliseconds) to a Date object
      updatedAt: new Date(eventData.updated_at),
      archivedAt: null,
    };
    // Validate using Zod
    const validatedNewUserData = userSchemaDB.parse(newUserData);

    const response = await queries.users.createUser(validatedNewUserData);

    return response;
  } catch (e) {
    return {
      success: false,
      message: `Webhook Action: Unsuccessful insertion into the users table.`,
      error: `Errors: ${e}`,
    };
  }
}

export async function deleteUser(eventData: DeletedObjectJSON) {
  // Soft-deletion. Archival instead of hard deletion.
  try {
    const userClerkIdToBeDeleted = eventData.id;

    // Safeguard against undefined deletedUserClerkID
    if (userClerkIdToBeDeleted === undefined) {
      return {
        success: false,
        message: `Webhook Action: Unsuccessful archival in users table.`,
        error: `Errors: Clerk ID to be deleted is undefined.`,
      };
    }

    const result = await queries.users.getByClerkId(userClerkIdToBeDeleted);
    // Check if user exists.
    if (!result.success) {
      return {
        success: false,
        message: `Webhook Action: User "${userClerkIdToBeDeleted}" does not exist in the database. Archival aborted.`,
        error: `Error: User does not exist in database "${userClerkIdToBeDeleted}"`,
      };
    }

    // Check if user is already archived.
    const resp = await queries.users.checkUserArchiveStatus(
      userClerkIdToBeDeleted,
    );
    if (resp.success && resp.data) {
      return {
        success: true,
        message: `Webhook Action: User "${userClerkIdToBeDeleted}" is already archived in the database. Archival aborted.`,
        error: `Error: Already archived user "${userClerkIdToBeDeleted}"`,
      };
    }

    const response = await queries.users.deleteUser(userClerkIdToBeDeleted);

    return response;
  } catch (e) {
    return {
      success: false,
      message: `Webhook Action: Unsuccessful archival of user in users table.`,
      error: `Errors: ${e}`,
    };
  }
}

export async function updateUser(eventData: UserJSON) {
  try {
    const userClerkIdToBeUpdated = eventData.id;

    const result = await queries.users.getByClerkId(userClerkIdToBeUpdated);
    // Check if user exists.
    if (!result.success) {
      return {
        success: true,
        message: `Webhook Action: User "${userClerkIdToBeUpdated}" does not exist in the database. Updating aborted.`,
        error: `Error: User does not exist in database "${userClerkIdToBeUpdated}"`,
      };
    }

    const existingUser = result.data;

    // Construct the updatedUser object to be used.
    const emailResult = getUserPrimaryEmailAddress(eventData);

    // If an error is raised.
    if (!emailResult.success) {
      return emailResult;
    }

    const primary_email = emailResult.primaryEmailAddress;
    const name = `${eventData.first_name} ${eventData.last_name}`;

    // Identify fields that have new values.
    const changed: Partial<UserInsert> = {};
    if (existingUser.clerkId != userClerkIdToBeUpdated) {
      changed.clerkId = userClerkIdToBeUpdated;
    }
    if (existingUser.email !== primary_email) {
      changed.email = primary_email;
    }
    if (existingUser.name !== name) {
      changed.name = name;
    }
    if (existingUser.image_url !== eventData.image_url) {
      changed.image_url = eventData.image_url;
    }

    if (Object.keys(changed).length > 0) {
      changed.updatedAt = new Date(eventData.updated_at);
    }

    // Use the existing user's data first, then override the changed fields.
    const updatedUserData: UserInsert = {
      clerkId: existingUser.clerkId,
      email: existingUser.email,
      name: existingUser.name,
      image_url: existingUser.image_url,
      createdAt: existingUser.createdAt, // Convert to UNIX timestamp (milliseconds) to a Date object
      updatedAt: existingUser.updatedAt,
      archivedAt: existingUser.archivedAt,
      ...changed,
    };

    // Validate using Zod
    const validatedUpdatedUserData = userSchemaDB.parse(updatedUserData);

    const response = await queries.users.updateUser(
      validatedUpdatedUserData.clerkId,
      validatedUpdatedUserData,
    );

    return response;
  } catch (e) {
    return {
      success: false,
      message: `Webhook Action: Unsuccessful updating of user in users table.`,
      error: `Errors: ${e}`,
    };
  }
}
