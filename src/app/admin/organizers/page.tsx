"use client";

import React, { useState } from "react";
import { Users, Search, MoreHorizontal,  Trash2, AlertTriangle, Check, X } from "lucide-react";
// Edit,
import { useOrganizers } from "@/hooks/useOrganizers";
import OtpVerificationModal from "@/components/OtpVerificationModal";
export default function OrganizersPage() {
  const { data, loading, error, updateOrganizerStatus, deleteOrganizer } = useOrganizers();
  
  // State for search and filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    organizerId: string | null;
    organizerName: string;
  }>({
    isOpen: false,
    organizerId: null,
    organizerName: ""
  });
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  
  // State for organizer details modal
  const [selectedOrganizer, setSelectedOrganizer] = useState<any>(null);
  const [isOrganizerModalOpen, setIsOrganizerModalOpen] = useState(false);
  
  // State for OTP verification modal
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [organizerToVerify, setOrganizerToVerify] = useState<any>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading organizers...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  if (!data || !data.organizers) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">No organizers found</div>
      </div>
    );
  }

  const organizers = data.organizers;

  // Filter organizers based on search and status
  const filteredOrganizers = organizers.filter(organizer => {
    // Search filter
    const matchesSearch = searchQuery === "" || 
      `${organizer.firstName} ${organizer.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      organizer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (organizer.orgName && organizer.orgName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (organizer.username && organizer.username.toLowerCase().includes(searchQuery.toLowerCase()));

    // Status filter
    const matchesStatus = statusFilter === "All Status" || organizer.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Toggle dropdown visibility
  const toggleDropdown = (organizerId: string) => {
    if (openDropdownId === organizerId) {
      setOpenDropdownId(null);
    } else {
      setOpenDropdownId(organizerId);
    }
  };

  // Close dropdown when clicking outside
  const closeDropdown = () => {
    setOpenDropdownId(null);
  };

  // Open delete confirmation
  const openDeleteConfirmation = (organizerId: string, organizerName: string) => {
    setDeleteConfirmation({
      isOpen: true,
      organizerId,
      organizerName
    });
  };

  // Close delete confirmation
  const closeDeleteConfirmation = () => {
    setDeleteConfirmation({
      isOpen: false,
      organizerId: null,
      organizerName: ""
    });
  };

  // Delete organizer
  const handleDeleteOrganizer = async () => {
    if (deleteConfirmation.organizerId) {
      try {
        await deleteOrganizer(deleteConfirmation.organizerId);
        closeDeleteConfirmation();
      } catch (error: any) {
        alert(error.message);
      }
    }
  };

  // Update organizer status
  const handleStatusUpdate = async (organizerId: string, phoneNumberVerified: boolean) => {
    try {
      await updateOrganizerStatus(organizerId, phoneNumberVerified);
      setOpenDropdownId(null);
    } catch (error: any) {
      alert(error.message);
    }
  };

  // Open organizer details modal
  const openOrganizerModal = (organizer: any) => {
    setSelectedOrganizer(organizer);
    setIsOrganizerModalOpen(true);
  };

  // Close organizer details modal
  const closeOrganizerModal = () => {
    setSelectedOrganizer(null);
    setIsOrganizerModalOpen(false);
  };

  // Open OTP verification modal
  // const openOtpVerificationModal = (organizer: any) => {
  //   setOrganizerToVerify(organizer);
  //   setIsOtpModalOpen(true);
  // };

  // Handle OTP verification success
  const handleVerificationSuccess = async (data: any) => {
    // Update the organizer status to verified
    if (organizerToVerify) {
      try {
        await updateOrganizerStatus(organizerToVerify.id, true);
      } catch (error: any) {
        alert(error.message);
      }
    }
  };

  // Sample organizer data
  // const organizers = [
  //   { id: 1, name: "Adventure Lanka Tours", email: "info@adventurelanka.com", events: 12, status: "Active" },
  //   { id: 2, name: "Colombo Experiences", email: "hello@colomboexp.com", events: 8, status: "Active" },
  //   { id: 3, name: "Sri Lanka Journeys", email: "bookings@sljourneys.com", events: 5, status: "Pending" },
  //   { id: 4, name: "Kandy Cultural Tours", email: "tours@kandyculture.com", events: 10, status: "Active" },
  //   { id: 5, name: "Beach Paradise Tours", email: "info@beachparadise.com", events: 0, status: "Inactive" },
  // ];

  return (
    <div onClick={closeDropdown}>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-black">Organizers</h1>
          <p className="text-gray-600 mt-1">Manage event organizers on the platform</p>
        </div>
        {/* <button className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors">
          <Plus size={18} />
          <span>Add Organizer</span>
        </button> */}
      </div>

      {/* Search and filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search organizers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 outline-none"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 outline-none"
          >
            <option>All Status</option>
            <option>Active</option>
            <option>Pending</option>
            <option>Inactive</option>
          </select>
        </div>
      </div>

      {/* Organizers table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Organizer
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Events
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredOrganizers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  No organizers found
                </td>
              </tr>
            ) : filteredOrganizers.map((organizer) => (
              <tr key={organizer.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => openOrganizerModal(organizer)}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <Users size={16} className="text-gray-600" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {organizer.firstName} {organizer.lastName}
                      </div>
                      <div className="text-xs text-gray-500">{organizer.orgName}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{organizer.email}</div>
                  <div className="text-xs text-gray-500">@{organizer.username}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{organizer.eventCount}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${organizer.status === 'Active' ? 'bg-green-100 text-green-800' : 
                    organizer.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-gray-100 text-gray-800'}`}>
                    {organizer.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                    {/* <button className="p-1 text-gray-500 hover:text-black">
                      <Edit size={16} />
                    </button> */}
                    <button 
                      className="p-1 text-gray-500 hover:text-red-500"
                      onClick={() => openDeleteConfirmation(organizer.id, `${organizer.firstName} ${organizer.lastName}`)}
                    >
                      <Trash2 size={16} />
                    </button>
                    <div className="relative">
                      <button 
                        className="p-1 text-gray-500 hover:text-black"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleDropdown(organizer.id);
                        }}
                      >
                        <MoreHorizontal size={16} />
                      </button>
                      
                      {/* Dropdown menu */}
                      {openDropdownId === organizer.id && (
                        <div 
                          className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="py-1">
                            {organizer.phoneNumberVerified ? (
                              <button
                                onClick={() => handleStatusUpdate(organizer.id, false)}
                                className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <X size={16} className="mr-2 text-red-500" />
                                Mark as Pending
                              </button>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleStatusUpdate(organizer.id, true)}
                                  className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <Check size={16} className="mr-2 text-green-500" />
                                  Verify Directly
                                </button>
                                {/* <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openOtpVerificationModal(organizer);
                                  }}
                                  className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <Check size={16} className="mr-2 text-blue-500" />
                                  Verify via OTP
                                </button> */}
                              </>
                            )}
                            <button className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                              View Details
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* Pagination */}
        <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredOrganizers.length}</span> of <span className="font-medium">{organizers.length}</span> results
          </div>
          <div className="flex gap-1">
            <button className="bg-white border border-gray-300 text-gray-500 hover:bg-gray-50 px-4 py-2 text-sm font-medium rounded-md">
              Previous
            </button>
            <button className="bg-black border border-black text-white hover:bg-gray-800 px-4 py-2 text-sm font-medium rounded-md">
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmation.isOpen && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 z-50 flex items-center justify-center p-4 pt-10" onClick={closeDropdown}>
          <div 
            className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl mt-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
              <AlertTriangle size={24} className="text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-center text-gray-900 mb-2">Confirm Delete</h3>
            <p className="text-center text-gray-500 mb-6">
              Are you sure you want to delete organizer <span className="font-medium">{deleteConfirmation.organizerName}</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={closeDeleteConfirmation}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteOrganizer}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Organizer Details Modal */}
      {isOrganizerModalOpen && selectedOrganizer && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 z-50 flex items-center justify-center p-4 pt-10" onClick={closeOrganizerModal}>
          <div 
            className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative w-full h-32 bg-gradient-to-r from-gray-800 to-black rounded-t-lg">
              <div className="absolute inset-0 bg-grey bg-opacity-20"></div>
              <div className="absolute top-4 right-4">
                <button
                  onClick={closeOrganizerModal}
                  className="bg-white rounded-full p-2 hover:bg-gray-100 shadow-lg"
                >
                  <X size={20} className="text-gray-600" />
                </button>
              </div>
              <div className="absolute bottom-4 left-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-16 w-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <Users size={24} className="text-gray-600" />
                  </div>
                  <div className="ml-4 text-white">
                    <h2 className="text-2xl font-bold">{selectedOrganizer.firstName} {selectedOrganizer.lastName}</h2>
                    <p className="text-gray-200">{selectedOrganizer.orgName}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {/* Organizer Header */}
              <div className="mb-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center text-gray-600 mb-2">
                      <span className="text-sm">@{selectedOrganizer.username}</span>
                    </div>
                    <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full 
                      ${selectedOrganizer.status === 'Active' ? 'bg-green-100 text-green-800' : 
                      selectedOrganizer.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-gray-100 text-gray-800'}`}>
                      {selectedOrganizer.status}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-black">{selectedOrganizer.eventCount}</div>
                    <div className="text-sm text-gray-500">Total Events</div>
                  </div>
                </div>
              </div>

              {/* Organizer Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-black mb-3">Personal Information</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-600 text-sm">Full Name:</span>
                      <p className="font-medium">{selectedOrganizer.firstName} {selectedOrganizer.lastName}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 text-sm">Email:</span>
                      <p className="font-medium">{selectedOrganizer.email}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 text-sm">Phone Number:</span>
                      <p className="font-medium">{selectedOrganizer.phoneNumber || 'Not provided'}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 text-sm">Phone Verified:</span>
                      <p className="font-medium">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          selectedOrganizer.phoneNumberVerified 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {selectedOrganizer.phoneNumberVerified ? 'Verified' : 'Not Verified'}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-black mb-3">Organization Details</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-600 text-sm">Organization Name:</span>
                      <p className="font-medium">{selectedOrganizer.orgName}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 text-sm">Username:</span>
                      <p className="font-medium">@{selectedOrganizer.username}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 text-sm">User Role:</span>
                      <p className="font-medium">{selectedOrganizer.role}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 text-sm">Events Created:</span>
                      <p className="font-medium flex items-center">
                        <Users size={16} className="mr-1" /> {selectedOrganizer.eventCount}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Admin Information */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-black mb-3">Admin Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-600 text-sm">User ID:</span>
                      <p className="font-medium font-mono text-xs">{selectedOrganizer.id}</p>
                    </div>
                    
                  </div>
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-600 text-sm">Last Updated:</span>
                      <p className="font-medium">{new Date(selectedOrganizer.updatedAt).toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 text-sm">Account Status:</span>
                      <p className="font-medium">{selectedOrganizer.phoneNumberVerified ? 'Active & Verified' : 'Pending Verification'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end">
                <button
                  onClick={closeOrganizerModal}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none"
                >
                  Close
                </button>
                {!selectedOrganizer.phoneNumberVerified ? (
                  <>
                    <button
                      onClick={() => {
                        handleStatusUpdate(selectedOrganizer.id, true);
                        closeOrganizerModal();
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none"
                    >
                      Verify Directly
                    </button>
                    {/* <button
                      onClick={() => {
                        closeOrganizerModal();
                        openOtpVerificationModal(selectedOrganizer);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none"
                    >
                      Verify via OTP
                    </button> */}
                  </>
                ) : (
                  <button
                    onClick={() => {
                      handleStatusUpdate(selectedOrganizer.id, false);
                      closeOrganizerModal();
                    }}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 focus:outline-none"
                  >
                    Mark as Pending
                  </button>
                )}
                <button
                  onClick={() => {
                    openDeleteConfirmation(
                      selectedOrganizer.id, 
                      `${selectedOrganizer.firstName} ${selectedOrganizer.lastName}`
                    );
                    closeOrganizerModal();
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none"
                >
                  Delete Organizer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* OTP Verification Modal */}
      {isOtpModalOpen && organizerToVerify && (
        <OtpVerificationModal
          isOpen={isOtpModalOpen}
          onClose={() => setIsOtpModalOpen(false)}
          phoneNumber={organizerToVerify.phoneNumber || ""}
          isOrganizer={true}
          onVerificationSuccess={handleVerificationSuccess}
        />
      )}
    </div>
  );
}