import { NextResponse } from "next/server";
import { initAdmin, getAdminDB } from "@/db/firebaseAdmin";
import { v4 as uuidv4 } from "uuid";

/**
 * API endpoint for processing event creation payments via mSpace
 */
export async function POST(request: Request) {
  try {
    // Get request data
    const requestData = await request.json();
    const { amount, userId, eventDetails, currency = "LKR" } = requestData;

    console.log(`[Event Payment] Processing payment for user ${userId}:`, {
      amount,
      eventDetails: {
        title: eventDetails?.title,
        price: eventDetails?.price,
        maxParticipants: eventDetails?.maxParticipants,
      },
    });

    if (!amount || !userId || !eventDetails) {
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

      // Get user details using document ID instead of uid field
      // This is the key fix - directly get the document by ID
      try {
        const userDoc = await adminDB.collection("users").doc(userId).get();

        if (!userDoc.exists) {
          console.log(
            `[Event Payment] User document not found for ID: ${userId}`
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
        console.log(`[Event Payment] Found user data:`, {
          id: userDoc.id,
          hasSubscriberId: !!userData?.maskedSubscriberId,
          phoneNumber: userData?.phoneNumber,
        });

        const subscriberId = userDoc.id;
        // const subscriberId = userData?.maskedSubscriberId;

        if (!subscriberId) {
          console.log(
            `[Event Payment] User ${userId} has no maskedSubscriberId`
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

        // Record payment transaction in database
        // Create payment document with all information at once
        const paymentDocRef = adminDB
          .collection("eventPayments")
          .doc(externalTrxId);
        await paymentDocRef.set({
          externalTrxId,
          userId,
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
          paymentType: "event_creation_fee",
        });

        console.log(
          `[Event Payment] Making mSpace API call with externalTrxId: ${externalTrxId} and subscriberId: ${subscriberId}`
        );

        // Create a dummy response for testing without calling mSpace API
        const mspaceResponse = {
          ok: true,
          statusCode: "S1000",
          statusDetail: "Success",
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
        //     `[Event Payment] mSpace API error: ${mspaceResponse.status}`,
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

        const mspaceData = mspaceResponse;
        // const mspaceData = await mspaceResponse.json();
        console.log(
          "[Event Payment] mSpace Response:",
          JSON.stringify(mspaceData, null, 2)
        );

        // Update the same document with the response data
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

        // Return response to client
        return NextResponse.json({
          success: true,
          statusCode: mspaceData.statusCode,
          statusDetail: mspaceData.statusDetail,
          externalTrxId,
          timeStamp: mspaceData.timeStamp,
        });
        // // Update the same document with the response data
        // await paymentDocRef.update({
        //   statusCode: mspaceData.statusCode,
        //   statusDetail: mspaceData.statusDetail,
        //   internalTrxId: mspaceData.internalTrxId,
        //   timeStamp: mspaceData.timeStamp,
        //   updatedAt: new Date().toISOString(),
        //   mspaceResponse: mspaceData,
        //   // Update status based on response
        //   status: mspaceData.statusCode === "S1000" ? "success" : "failed",
        // });

        // // Return response to client
        // return NextResponse.json({
        //   success: true,
        //   statusCode: mspaceData.statusCode,
        //   statusDetail: mspaceData.statusDetail,
        //   externalTrxId,
        //   timeStamp: mspaceData.timeStamp,
        // });
      } catch (userError) {
        console.error("[Event Payment] Error fetching user:", userError);
        return NextResponse.json(
          {
            success: false,
            statusCode: "E1001",
            statusDetail: "Error retrieving user data",
          },
          { status: 500 }
        );
      }
    } catch (dbError: any) {
      console.error("[Event Payment] Database error:", dbError);
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
    console.error("[Event Payment] Server error:", error);
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
