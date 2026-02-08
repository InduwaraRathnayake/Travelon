"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  User,
  Building2,
  Mail,
  Phone,
  MapPin,
  Edit,
  Calendar,
  Shield,
  CheckCircle,
  XCircle,
  CreditCard,
  Upload,
  Loader,
} from "lucide-react";
import OtpVerificationModal from "@/components/OtpVerificationModal";
import ProfileEditModal from "@/components/ProfileEditModal";
import BankDetailsModal, { BankDetails } from "@/components/BankDetailsModal";
import Image from "next/image";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { storage } from "@/db/firebaseClient";

// Update UserProfile interface to include profileImage
interface UserProfile {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  orgName: string;
  phoneNumber: string;
  address: string;
  district: string;
  role: string;
  phoneNumberVerified: boolean;
  updatedAt: string;
  subscriptionStatus?: string;
  profileImage?: string; // Add this for profile image
  bankDetails?: {
    bankName: string;
    bankCode: string;
    branchName: string;
    branchCode: string;
    accountNumber: string;
    updatedAt: string;
  };
}

const ProfilePage = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showOrgModal, setShowOrgModal] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false); // New state
  const [verifying, setVerifying] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Add these states for image handling
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(
    null
  );
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Constants for image validation
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

  // Fetch profile data
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/organizer/profile");

      if (!response.ok) {
        throw new Error("Failed to load profile data");
      }

      const data = await response.json();
      setProfile(data.user);
    } catch (err: any) {
      setError(err.message);
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Handle successful verification
  const handleVerificationSuccess = async (data: {
    subscriberId: string;
    subscriptionStatus: string;
    token: string;
  }) => {
    try {
      setVerifying(true);
      // The backend already updated our profile in the verify route,
      // we just need to refresh the profile data to reflect the changes
      await fetchProfile();

      // Show success message with simple state
      setSuccessMessage("Phone number verified successfully!");

      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);

      console.log(
        "Verification successful with subscriberId:",
        data.subscriberId
      );
    } catch (err) {
      console.error("Error refreshing profile after verification:", err);
    } finally {
      setVerifying(false);
    }
  };

  // Handle successful profile update
  const handleProfileUpdate = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
  };

  // Handle bank details update
  const handleBankDetailsUpdate = async (bankDetails: BankDetails) => {
    try {
      const response = await fetch("/api/organizer/profile/update-bank", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bankDetails),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update bank details");
      }

      const data = await response.json();
      setProfile(data.user);

      // Show success message
      setSuccessMessage("Bank details updated successfully!");
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (err: any) {
      console.error("Error updating bank details:", err);
      setError(err.message);
    }
  };

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageError(null);

    if (!e.target.files?.length) return;

    const file = e.target.files[0];

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      setImageError(
        "Invalid file type. Please upload JPEG, PNG, or WebP image."
      );
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setImageError("Image too large. Maximum size is 5MB.");
      return;
    }

    // Create preview and set file
    setProfileImageFile(file);
    setProfileImagePreview(URL.createObjectURL(file));
  };

  // Upload profile image
  const uploadProfileImage = async () => {
    if (!profileImageFile || !profile) return;

    try {
      setUploadingImage(true);
      setImageError(null);

      // Create unique filename
      const filename = `profile_${
        profile.username
      }_${Date.now()}.${profileImageFile.name.split(".").pop()}`;
      const storageRef = ref(storage, `users-organizers/${filename}`);

      // Upload image
      const uploadTask = uploadBytesResumable(storageRef, profileImageFile);

      // Monitor upload with progress tracking
      await new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log(`Upload progress: ${progress.toFixed(2)}%`);
          },
          (error) => {
            console.error("Upload error:", error);
            reject(error);
          },
          () => resolve(undefined)
        );
      });

      // Get download URL
      const downloadURL = await getDownloadURL(storageRef);

      // Save profile image URL to database
      const response = await fetch("/api/organizer/profile/update-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ profileImage: downloadURL }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update profile image");
      }

      // Update local state
      const data = await response.json();
      setProfile(data.user);

      // Show success message
      setSuccessMessage("Profile image updated successfully!");
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (err: any) {
      console.error("Error updating profile image:", err);
      setImageError(err.message || "Failed to upload image. Please try again.");
    } finally {
      setUploadingImage(false);
    }
  };

  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (loading && !profile) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
        <p className="ml-2 text-gray-600">Loading Profile data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded shadow-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <XCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">
              {error}. Please try refreshing the page.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded shadow-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <XCircle className="h-5 w-5 text-yellow-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              No profile data found. Please complete your profile.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Success message notification */}
      {successMessage && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
          <CheckCircle size={16} className="mr-2" />
          <p>{successMessage}</p>
          <button
            onClick={() => setSuccessMessage(null)}
            className="ml-auto text-green-700"
          >
            <XCircle size={16} />
          </button>
        </div>
      )}

      {/* OTP Verification Modal */}
      <OtpVerificationModal
        isOpen={showVerifyModal}
        onClose={() => setShowVerifyModal(false)}
        phoneNumber={profile?.phoneNumber || ""}
        isOrganizer={true} // This is the organizer section, so set to true
        onVerificationSuccess={handleVerificationSuccess}
      />

      {/* Profile Edit Modal */}
      {profile && (
        <ProfileEditModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          profile={profile}
          onUpdateSuccess={handleProfileUpdate}
        />
      )}

      {/* Organization Edit Modal */}
      {profile && (
        <ProfileEditModal
          isOpen={showOrgModal}
          onClose={() => setShowOrgModal(false)}
          profile={profile}
          onUpdateSuccess={handleProfileUpdate}
          isOrgUpdate={true}
        />
      )}

      {/* Bank Details Modal - New addition */}
      <BankDetailsModal
        isOpen={showBankModal}
        onClose={() => setShowBankModal(false)}
        onSave={handleBankDetailsUpdate}
        initialDetails={profile?.bankDetails}
      />

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".jpg,.jpeg,.png,.webp"
        className="hidden"
      />

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
        <button
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          onClick={() => setShowEditModal(true)}
        >
          <Edit size={16} />
          Edit Profile
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Summary Card */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-100 mb-4">
                  {profileImagePreview ? (
                    <Image
                      src={profileImagePreview}
                      alt="Profile preview"
                      width={96}
                      height={96}
                      className="object-cover w-full h-full"
                    />
                  ) : profile?.profileImage ? (
                    <Image
                      src={profile.profileImage}
                      alt={`${profile.firstName} ${profile.lastName}`}
                      width={96}
                      height={96}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <User size={40} className="text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Image upload button */}
                <button
                  onClick={triggerFileInput}
                  className="absolute bottom-3 right-0 bg-black text-white p-1.5 rounded-full hover:bg-gray-700 transition-colors"
                  title="Change profile picture"
                >
                  <Edit size={14} />
                </button>
              </div>

              {/* Display upload button when a new image is selected */}
              {profileImagePreview && (
                <div className="mb-4 w-full">
                  <button
                    onClick={uploadProfileImage}
                    disabled={uploadingImage}
                    className="w-full flex items-center justify-center gap-2 bg-black text-white px-3 py-1.5 rounded-lg hover:bg-gray-800 transition-colors text-sm"
                  >
                    {uploadingImage ? (
                      <>
                        <Loader size={14} className="animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload size={14} />
                        Upload Image
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Display image error if any */}
              {imageError && (
                <div className="mb-4 text-xs text-red-500 text-center">
                  {imageError}
                </div>
              )}

              <h2 className="text-xl font-semibold">
                {profile.firstName} {profile.lastName}
              </h2>
              <p className="text-gray-500 mb-2">@{profile.username}</p>

              <div className="flex items-center text-sm bg-gray-100 px-3 py-1 rounded-full">
                <Shield size={14} className="mr-1" />
                <span className="capitalize">{profile.role}</span>
              </div>

              <div className="border-t border-gray-200 w-full my-4"></div>

              <div className="w-full">
                <div className="flex items-center mb-3">
                  <Building2 size={16} className="text-gray-500 mr-2" />
                  <span className="text-gray-800">{profile.orgName}</span>
                </div>
                <div className="flex items-center">
                  <Calendar size={16} className="text-gray-500 mr-2" />
                  <span className="text-gray-600 text-sm">
                    Updated: {new Date(profile.updatedAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Subscription Status - Show if available */}
                {profile.subscriptionStatus && (
                  <div className="flex items-center mt-3">
                    <CheckCircle
                      size={16}
                      className={`mr-2 ${
                        profile.subscriptionStatus === "subscribed"
                          ? "text-green-500"
                          : "text-gray-500"
                      }`}
                    />
                    <span
                      className={`text-sm ${
                        profile.subscriptionStatus === "subscribed"
                          ? "text-green-600"
                          : "text-gray-600"
                      }`}
                    >
                      {/* {profile.subscriptionStatus.charAt(0).toUpperCase() +
                        profile.subscriptionStatus.slice(1)} */}
                      {profile.subscriptionStatus === "subscribed" ? "Active" : "Inactive"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details Card */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            {/* Contact Information */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4 border-b border-gray-200 pb-2">
                Contact Information
              </h3>

              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-start">
                  <Mail className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-gray-800">{profile.email}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Phone className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
                  <div className="flex-grow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <p className="text-sm text-gray-500 mr-2">
                          Phone Number
                        </p>
                        {/* {profile.phoneNumberVerified ? (
                          <span className="inline-flex items-center bg-green-50 text-green-700 text-xs px-2 py-0.5 rounded-full">
                            <CheckCircle size={12} className="mr-1" />
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center bg-yellow-50 text-yellow-700 text-xs px-2 py-0.5 rounded-full">
                            <XCircle size={12} className="mr-1" />
                            Not Verified
                          </span>
                        )} */}
                      </div>

                      {/* {!profile.phoneNumberVerified && (
                        <button
                          onClick={() => setShowVerifyModal(true)}
                          className="text-xs bg-black text-white px-2 py-1 rounded hover:bg-gray-800 transition-colors"
                          disabled={verifying}
                        >
                          {verifying ? "Verifying..." : "Verify Now"}
                        </button>
                      )} */}
                    </div>
                    <p className="text-gray-800">{profile.phoneNumber}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4 border-b border-gray-200 pb-2">
                Location Information
              </h3>

              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="text-gray-800">{profile.address}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">District</p>
                    <p className="text-gray-800">{profile.district}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {!profile.phoneNumberVerified && (
            <button
              onClick={() => setShowVerifyModal(true)}
              className="flex items-center justify-center gap-2 bg-green-50 text-green-700 px-4 py-3 rounded-lg hover:bg-green-100 transition-colors border border-green-200"
              disabled={verifying}
            >
              <Phone size={16} />
              {verifying ? "Verifying..." : "Verify Phone Number"}
            </button>
          )}

          <button
            className="flex items-center justify-center gap-2 bg-gray-50 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
            onClick={() => setShowEditModal(true)}
          >
            <Shield size={16} />
            Security Settings
          </button>

          <button
            className="flex items-center justify-center gap-2 bg-gray-50 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
            onClick={() => setShowOrgModal(true)}
          >
            <Building2 size={16} />
            Update Organization
          </button>

          {/* New Bank Details Button */}
          <button
            className="flex items-center justify-center gap-2 bg-gray-50 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
            onClick={() => setShowBankModal(true)}
          >
            <CreditCard size={16} />
            {profile?.bankDetails ? "Update Bank Details" : "Add Bank Details"}
          </button>
        </div>
      </div>

      {/* Bank Account Details Card - show if bank details exist */}
      {profile?.bankDetails && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Bank Account Details</h3>
            <button
              onClick={() => setShowBankModal(true)}
              className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-lg transition-colors flex items-center gap-1"
            >
              <Edit size={14} />
              Edit
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Bank Name</p>
              <p className="text-gray-800">{profile.bankDetails.bankName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Bank Code</p>
              <p className="text-gray-800">{profile.bankDetails.bankCode}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Branch Name</p>
              <p className="text-gray-800">{profile.bankDetails.branchName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Branch Code</p>
              <p className="text-gray-800">{profile.bankDetails.branchCode}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-gray-500">Account Number</p>
              <p className="text-gray-800">
                {profile.bankDetails.accountNumber}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
