"use server";

// import { clerkClient } from "@/lib/clerk-client";
import { ClerkAPIResponseError } from "@clerk/types";

export async function createEmailAddress(
  userId: string,
  emailAddress: string,
  verified?: boolean,
  primary?: boolean,
) {
  try {
    // https://clerk.com/docs/reference/backend-api/tag/email-addresses/post/email_addresses#tag/email-addresses/post/email_addresses
    // Call the clerk API
    const response = await fetch("https://api.clerk.com/v1/email_addresses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
      },
      body: JSON.stringify({
        user_id: userId,
        email_address: emailAddress,
        verified: verified ?? null,
        primary: primary ?? null,
      }),
    });

    // data is an email address object https://clerk.com/docs/references/javascript/types/email-address
    const data = await response.json();

    // If response is 200-299
    if (response.ok) {
      return {
        success: true,
        message: "Successfully created the email address.",
        data,
      };
    } else {
      return {
        success: false,
        message: `Unable to create the email address ${response.status}`,
        errors: data.errors ?? [],
      };
    }
  } catch (e: unknown) {
    const error = e as ClerkAPIResponseError;
    const errorMessages = error.errors
      .map((error, index) => {
        return `Error #${index}: Code ${error.code} Message: ${error.message}`;
      })
      .join("\n");

    return {
      success: false,
      message: `Failed to create the email address: ${errorMessages}. `,
    };
  }
}

// export async function updateUserEmail(emailAddressID: string) {
//   try {
//     // https://clerk.com/docs/reference/backend-api/tag/email-addresses/patch/email_addresses/%7Bemail_address_id%7D
//     const params = { primary: true, verified: true };
//     const response = await clerkClient.emailAddresses.updateEmailAddress(
//       emailAddressID,
//       params,
//     );

//     if (response) {
//       return {
//         success: true,
//         message: "Successfully updated the email address.",
//       };
//     }
//   } catch (e: unknown) {
//     const error = e as ClerkAPIResponseError;
//     const errorMessages = error.errors
//       .map((error, index) => {
//         return `Error ${index}: Code: ${error.code} Message: ${error.message}`;
//       })
//       .join("\n");

//     return {
//       success: false,
//       message: `Failed to update User Email: ${errorMessages}. `,
//     };
//   }
// }
