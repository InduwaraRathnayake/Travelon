import { NextResponse } from "next/server";
import { initAdmin, getAdminDB } from "@/db/firebaseAdmin";
import { v4 as uuidv4 } from "uuid";

/**
 * API endpoint for processing event boost payments via mSpace
 */
export async function POST(request: Request) {
  try {
    // Get request data
    const requestData = await request.json();
    const {
      amount,
      userId,
      eventId,
      eventDetails,
      currency = "LKR",
    } = requestData;

    console.log(
      `[Event Boost Payment] Processing payment for event ${eventId}:`,
      {
        amount,
        userId,
        eventDetails: {
          title: eventDetails?.title,
          price: eventDetails?.price,
        },
      }
    );

    if (!amount || !userId || !eventId || !eventDetails) {
      return NextResponse.json(
        {
          success: false,
          statusCode: "E1000",
          statusDetail: "Missing required parameters",
        },
        { status: 400 }
      );
    }

    // Generate unique transaction ID for mSpace
    const externalTrxId = uuidv4().replace(/-/g, "");

    try {
      // Initialize Firebase Admin
      await initAdmin();
      const adminDB = getAdminDB();

      // Verify the event exists and belongs to this user
      const eventDoc = await adminDB.collection("events").doc(eventId).get();

      if (!eventDoc.exists) {
        return NextResponse.json(
          {
            success: false,
            statusCode: "E1001",
            statusDetail: "Event not found",
          },
          { status: 404 }
        );
      }

      const eventData = eventDoc.data();

      if (eventData?.organizerId !== userId) {
        return NextResponse.json(
          {
            success: false,
            statusCode: "E1003",
            statusDetail: "You don't have permission to boost this event",
          },
          { status: 403 }
        );
      }

      // Get user details using document ID
      try {
        const userDoc = await adminDB.collection("users").doc(userId).get();

        if (!userDoc.exists) {
          console.log(
            `[Event Boost Payment] User document not found for ID: ${userId}`
          );
          return NextResponse.json(
            {
              success: false,
              statusCode: "E1001",
              statusDetail: "User not found",
            },
            { status: 404 }
          );
        }

        const userData = userDoc.data();
        // console.log(`[Event Boost Payment] Found user data:`, {
        //   id: userDoc.id,
        //   hasSubscriberId: !!userData?.maskedSubscriberId,
        //   phoneNumber: userData?.phoneNumber,
        // });

        const subscriberId = userDoc.id;
        // const subscriberId = userData?.maskedSubscriberId;

        if (!subscriberId) {
          console.log(
            `[Event Boost Payment] User ${userId} has no maskedSubscriberId`
          );
          return NextResponse.json(
            {
              success: false,
              statusCode: "E1002",
              statusDetail: "User is not subscribed to mSpace",
            },
            { status: 400 }
          );
        }

        // Create payment document with all information at once
        const paymentDocRef = adminDB
          .collection("eventBoostPayments")
          .doc(externalTrxId);

        await paymentDocRef.set({
          externalTrxId,
          userId,
          eventId,
          subscriberId,
          amount,
          currency,
          status: "pending",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          eventDetails: {
            title: eventDetails.title,
            price: eventDetails.price,
            maxParticipants: eventDetails.maxParticipants,
            eventType: eventDetails.eventType,
          },
          paymentType: "event_boost_fee",
          boostRequestStatus: "pending", // pending, approved, rejected
        });

        console.log(
          `[Event Boost Payment] Making mSpace API call with externalTrxId: ${externalTrxId} and subscriberId: ${subscriberId}`
        );

        // Make dummy response for testing
        const mspaceResponse = {
          ok: true,
          statusCode: "S1000",
          statusDetail: "Payment successful",
          internalTrxId: "INT-" + externalTrxId,
          timeStamp: new Date().toISOString(),
        }
        // const mspaceResponse = await fetch(
        //   "https://api.mspace.lk/caas/direct/debit",
        //   {
        //     method: "POST",
        //     headers: {
        //       "Content-Type": "application/json;charset=utf-8",
        //     },
        //     body: JSON.stringify({
        //       applicationId: process.env.MSPACE_APP_ID,
        //       password: process.env.MSPACE_PASSWORD,
        //       externalTrxId,
        //       subscriberId,
        //       paymentInstrumentName: "Mobile Account",
        //       amount,
        //       currency,
        //     }),
        //   }
        // );

        // if (!mspaceResponse.ok) {
        //   const errorText = await mspaceResponse.text();
        //   console.error(
        //     `[Event Boost Payment] mSpace API error: ${mspaceResponse.status}`,
        //     errorText
        //   );

        //   return NextResponse.json(
        //     {
        //       success: false,
        //       statusCode: "E1003",
        //       statusDetail: `mSpace API error: ${mspaceResponse.status}`,
        //     },
        //     { status: 500 }
        //   );
        // }

        const mspaceData = mspaceResponse
        console.log(
          "[Event Boost Payment] mSpace Response:",
          JSON.stringify(mspaceData, null, 2)
        );

        // Update the payment document with mSpace response
        await paymentDocRef.update({
          statusCode: mspaceData.statusCode,
          statusDetail: mspaceData.statusDetail,
          internalTrxId: mspaceData.internalTrxId,
          timeStamp: mspaceData.timeStamp,
          updatedAt: new Date().toISOString(),
          mspaceResponse: mspaceData,
          // Update status based on response
          status: mspaceData.statusCode === "S1000" ? "success" : "failed",
        });

        // Create a boost request in the database
        if (mspaceData.statusCode === "S1000") {
          await adminDB.collection("boostRequests").add({
            eventId,
            userId,
            paymentId: externalTrxId,
            status: "pending", // pending, approved, rejected
            requestedAt: new Date().toISOString(),
            amount,
            eventTitle: eventDetails.title,
          });
        }

        // Return response to client
        return NextResponse.json({
          success: true,
          statusCode: mspaceData.statusCode,
          statusDetail: mspaceData.statusDetail,
          externalTrxId,
          timeStamp: mspaceData.timeStamp,
        });
      } catch (userError) {
        console.error("[Event Boost Payment] Error fetching user:", userError);
        return NextResponse.json(
          {
            success: false,
            statusCode: "E1004",
            statusDetail: "Error retrieving user data",
          },
          { status: 500 }
        );
      }
    } catch (dbError: any) {
      console.error("[Event Boost Payment] Database error:", dbError);
      return NextResponse.json(
        {
          success: false,
          statusCode: "E1004",
          statusDetail: "Database error: " + dbError.message,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("[Event Boost Payment] Server error:", error);
    return NextResponse.json(
      {
        success: false,
        statusCode: "E1005",
        statusDetail: "Server error: " + error.message,
      },
      { status: 500 }
    );
  }
}
