import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const event = await verifyWebhook(req);
    const { id } = event.data;
    const eventType = event.type;
    // ------ Log ------ //
    console.log(
      `Received webhook with ID ${id} and event type of ${eventType}`,
    );
    console.log("Webhook payload:", event.data);

    // ------ Log ------ //

    if (eventType == "user.created") {
      // Logic for inserting the user fields here for the db.
    } else if (eventType == "user.updated") {
      // Logic for updating the user fields here for the db.
    } else if (eventType == "user.deleted") {
      // Logic for archiving the user here for the db.
    }

    return new Response("Webhook received", { status: 200 });
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error verifying webhook", { status: 400 });
  }
}
