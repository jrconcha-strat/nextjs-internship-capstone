import { createUser, deleteUser, updateUser } from "@/actions/webhooks/webhook-actions";
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

    // Execute appropriate action depending on the event type of payload.
    switch (event.type) {
      case "user.created": {
        const result = await createUser(event.data);
        console.log(result) // Logging. Remove this in Production.
        break;
      }
      case "user.deleted": {
        const result = await deleteUser(event.data);
        console.log(result) // Logging. Remove this in Production.
        break;
      }
      case "user.updated": {
        const result = await updateUser(event.data);
        console.log(result) // Logging. Remove this in Production.
        break;
      }
      default:
        console.log(`Event Type Not Handled: ${event.type}`)
    }

    return new Response("Webhook received", { status: 200 });
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error verifying webhook", { status: 400 });
  }
}
