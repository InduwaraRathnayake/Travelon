import { NextResponse } from 'next/server';
import { initAdmin, getAdminDB } from '@/db/firebaseAdmin';

export async function POST(request: Request) {
  try {
    // Initialize Firebase Admin
    await initAdmin();
    
    const { uid, profileData } = await request.json();
    
    if (!uid || !profileData) {
      return NextResponse.json({ error: "Missing user data" }, { status: 400 });
    }
    
    // Store user profile in Firestore
    const adminDB = getAdminDB();
    await adminDB.collection('users').doc(uid).set({
      ...profileData,
      role: 'organizer', // Set role explicitly
      phoneNumberVerified: true, //for testing purposes, set to true by default. In production, this should be set based on actual verification status
      subscriptionStatus: 'subscribed', // Default subscription status should be 'Inactive' unless verified otherwise
      updatedAt: new Date().toISOString()
    });
    
    // Return success without setting cookies
    return NextResponse.json({ success: true });
    
  } catch (error: any) {
    console.error("Error in signup route:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred during signup" },
      { status: 500 }
    );
  }
}