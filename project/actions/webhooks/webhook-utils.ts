import { UserJSON } from "@clerk/backend";
import { PrimaryEmailResult } from "./webhook-types";

export function getUserPrimaryEmailAddress(
  eventData: UserJSON,
): PrimaryEmailResult {
  // Retrieve the single, primary email using primary email address id.
  const primary_email_id = eventData.primary_email_address_id;

  // Handle primary email ID may be null
  if (primary_email_id === null) {
    return {
      success: false,
      message: `Webhook Action: Unsuccessful operation in users table.`,
      error: `Errors: Primary Email ID of user is undefined or null.`,
    };
  }

  // Retrieve the primary_email object from the eventData array of email addresses
  const primary_email_object = eventData.email_addresses.find(
    (e) => e.id === primary_email_id,
  );

  // Handle unable to find the primary_email_object using primary email id
  if (primary_email_object === undefined) {
    return {
      success: false,
      message: `Webhook Action: Unsuccessful operation in users table.`,
      error: `Errors: Unable to find primary email address object using primary email id "${primary_email_id}". It may be that user does not have a primary email with that id.`,
    };
  }

  return {
    success: true,
    primaryEmailAddress: primary_email_object.email_address,
  };
}
