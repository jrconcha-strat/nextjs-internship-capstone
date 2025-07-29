"use server";
import { users } from "@/lib/db/schema";
import { DeletedObjectJSON, UserJSON } from "@clerk/backend";
import { db } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { UserInsert } from "@/types";
import { getUserPrimaryEmailAddress } from "./utils";

export async function createUser(eventData: UserJSON) {
  try {
    const userClerkIdToInsert = eventData.id;

    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.clerkId, userClerkIdToInsert),
    });
    if (existingUser) {
      return {
        success: true,
        message: `Webhook Action: User "${userClerkIdToInsert}" already exists in the database. Insertion aborted.`,
        error: `Error: Duplicate user "${userClerkIdToInsert}"`,
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

    const newUser: UserInsert = {
      clerkId: userClerkIdToInsert,
      email: primary_email,
      name: name,
      image_url: eventData.image_url,
      createdAt: new Date(eventData.created_at), // Convert to UNIX timestamp (milliseconds) to a Date object
      updatedAt: new Date(eventData.updated_at),
      isArchived: false,
      archivedAt: null,
    };
    const response = await db.insert(users).values(newUser);

    // Check if insertion is successful or not
    if (response.rowCount === 1) {
      return {
        success: true,
        message: `Webhook Action: Successful insertion into the users table of user with clerk id: ${JSON.stringify(newUser.clerkId)}`,
        error: null,
      };
    } else {
      return {
        success: false,
        message: `Webhook Action: Unsuccessful insertion into the users table of user with clerk id: ${JSON.stringify(newUser.clerkId)}`,
        error: `Error: response.rowCount return 0 rows modified. Check database connection.`,
      };
    }
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
    const userClerkIdToDelete = eventData.id;

    // Safeguard against undefined deletedUserClerkID
    if (userClerkIdToDelete === undefined) {
      return {
        success: false,
        message: `Webhook Action: Unsuccessful archival in users table.`,
        error: `Errors: Clerk ID to be deleted is undefined.`,
      };
    }
    // Check if user exists
    const [existingUser] = await db
      .select()
      .from(users)
      .limit(1)
      .where(and(eq(users.clerkId, userClerkIdToDelete)));
    if (!existingUser) {
      return {
        success: true,
        message: `Webhook Action: User "${userClerkIdToDelete}" does not exist in the database. Archival aborted.`,
        error: `Error: User does not exist in database "${userClerkIdToDelete}"`,
      };
    }

    // Check if user is already archived.
    const [archivedUser] = await db
      .select()
      .from(users)
      .limit(1)
      .where(
        and(eq(users.clerkId, userClerkIdToDelete), eq(users.isArchived, true)),
      );
    if (archivedUser) {
      return {
        success: true,
        message: `Webhook Action: User "${userClerkIdToDelete}" is already archived in the database. Archival aborted.`,
        error: `Error: Already archived user "${userClerkIdToDelete}"`,
      };
    }

    // Set soft-deletion fields
    const response = await db
      .update(users)
      .set({ isArchived: eventData.deleted, archivedAt: new Date() })
      .where(eq(users.clerkId, userClerkIdToDelete));

    // Check if deletion is successful or not. Find user using deletedUserClerkID and verify if isArchived flag is set to true.
    const [result] = await db
      .select()
      .from(users)
      .limit(1)
      .where(
        and(eq(users.clerkId, userClerkIdToDelete), eq(users.isArchived, true)),
      );

    if (response.rowCount === 1) {
      return {
        success: true,
        message: `Webhook Action: Successful archival in users table of user with clerk id: ${JSON.stringify(result.clerkId)}`,
        error: null,
      };
    } else {
      return {
        success: false,
        message: `Webhook Action: Unsuccessful archival in users table of user with clerk id:. ${JSON.stringify(result.clerkId)}`,
        error: `Error: response.rowCount return 0 rows modified. Check database connection.`,
      };
    }
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
    const userClerkIdToUpdate = eventData.id;

    // Check if user exists
    const [existingUser] = await db
      .select()
      .from(users)
      .limit(1)
      .where(and(eq(users.clerkId, userClerkIdToUpdate)));
    if (!existingUser) {
      return {
        success: true,
        message: `Webhook Action: User "${userClerkIdToUpdate}" does not exist in the database. Updating aborted.`,
        error: `Error: User does not exist in database "${userClerkIdToUpdate}"`,
      };
    }

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
    if (existingUser.clerkId != userClerkIdToUpdate) {
      changed.clerkId = userClerkIdToUpdate;
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
    const updatedUser: UserInsert = {
      clerkId: existingUser.clerkId,
      email: existingUser.email,
      name: existingUser.name,
      image_url: existingUser.image_url,
      createdAt: existingUser.createdAt, // Convert to UNIX timestamp (milliseconds) to a Date object
      updatedAt: existingUser.updatedAt,
      isArchived: existingUser.isArchived,
      archivedAt: existingUser.archivedAt,
      ...changed,
    };

    const response = await db
      .update(users)
      .set(updatedUser)
      .where(eq(users.clerkId, userClerkIdToUpdate));

    // Check if updating is successful or not
    if (response.rowCount === 1) {
      return {
        success: true,
        message: `Webhook Action: Successful updating into the users table of user with clerk id: ${JSON.stringify(updatedUser.clerkId)}`,
        error: null,
      };
    } else {
      return {
        success: false,
        message: `Webhook Action: Unsuccessful updating into the users table of user with clerk id: ${JSON.stringify(updatedUser.clerkId)}`,
        error: `Error: response.rowCount return 0 rows modified. Check database connection.`,
      };
    }
  } catch (e) {
    return {
      success: false,
      message: `Webhook Action: Unsuccessful updating of user in users table.`,
      error: `Errors: ${e}`,
    };
  }
}
