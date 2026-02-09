"use client";

import React, { useState } from "react";
import { Search, MoreHorizontal, Trash2, MapPin, Users, AlertTriangle, Check, X } from "lucide-react";
// , Edit
import Image from "next/image";
import { useEvents } from "@/hooks/useEvents";
// Calendar, Plus,
export default function EventsPage() {
  const { data, loading, error, updateEventStatus, deleteEvent: deleteEventFromDB } = useEvents();
  
  // State for search and filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  
  // State for delete confirmation modal
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    eventId: string | null;
    eventTitle: string;
    eventPhoto: string;
  }>({
    isOpen: false,
    eventId: null,
    eventTitle: "",
    eventPhoto: ""
  });

  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  
  // State for event details modal
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading events...</div>
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

  if (!data || !data.events) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">No events found</div>
      </div>
    );
  }

  const events = data.events;

  // Filter events based on search and status
  const filteredEvents = events.filter(event => {
    // Search filter
    const matchesSearch = searchQuery === "" || 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.organizerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (event.location && event.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (event.category && event.category.toLowerCase().includes(searchQuery.toLowerCase()));

    // Status filter
    const matchesStatus = statusFilter === "All Status" || event.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Toggle dropdown visibility
  const toggleDropdown = (eventId: string) => {
    if (openDropdownId === eventId) {
      setOpenDropdownId(null);
    } else {
      setOpenDropdownId(eventId);
    }
  };

  // Close dropdown when clicking outside
  const closeDropdown = () => {
    setOpenDropdownId(null);
  };

  // Open delete confirmation
  const openDeleteConfirmation = (eventId: string, eventTitle: string, eventPhoto: string) => {
    setDeleteConfirmation({
      isOpen: true,
      eventId,
      eventTitle,
      eventPhoto
    });
  };

  // Close delete confirmation
  const closeDeleteConfirmation = () => {
    setDeleteConfirmation({
      isOpen: false,
      eventId: null,
      eventTitle: "",
      eventPhoto: ""
    });
  };

  // Delete event
  const handleDeleteEvent = async () => {
    if (deleteConfirmation.eventId) {
      try {
        await deleteEventFromDB(deleteConfirmation.eventId);
        closeDeleteConfirmation();
      } catch (error: any) {
        alert(error.message);
      }
    }
  };

  // Update event status
  const handleStatusUpdate = async (eventId: string, isEnded: boolean) => {
    try {
      await updateEventStatus(eventId, isEnded);
      setOpenDropdownId(null);
    } catch (error: any) {
      alert(error.message);
    }
  };

  // Open event details modal
  const openEventModal = (event: any) => {
    setSelectedEvent(event);
    setIsEventModalOpen(true);
  };

  // Close event details modal
  const closeEventModal = () => {
    setSelectedEvent(null);
    setIsEventModalOpen(false);
  };

  return (
    <div onClick={closeDropdown}>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-black">Events</h1>
          <p className="text-gray-600 mt-1">Manage events hosted on the platform</p>
        </div>
        {/* <button className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors">
          <Plus size={18} />
          <span>Add Event</span>
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
            placeholder="Search events..."
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
            <option>Upcoming</option>
            <option>Completed</option>
          </select>
        </div>
      </div>

      {/* Events table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Event
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Organizer
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Participants
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
            {filteredEvents.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  No events found
                </td>
              </tr>
            ) : filteredEvents.map((event) => (
              <tr key={event.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => openEventModal(event)}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-12 w-12 rounded-md overflow-hidden">
                      <Image 
                        src={event.images && event.images.length > 0 ? event.images[0] : "/Sigiriya.jpg"} 
                        alt={event.title}
                        width={48}
                        height={48}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{event.title}</div>
                        <div className="text-xs text-gray-500 flex items-start mt-1">
                          <MapPin size={12} className="mr-1 flex-shrink-0" /> 
                          <span className="inline-block max-w-[120px]">
                            {event.location 
                              ? event.location.length > 40 
                                ? event.location.substring(0, 40) + '...' 
                                : event.location
                              : ''}
                          </span>
                        </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{event.organizerName}</div>
                  <div className="text-xs text-gray-500">{event.category}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{new Date(event.date).toLocaleDateString()}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 flex items-center">
                    <Users size={14} className="mr-1" /> {event.participantsCount}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${event.status === 'Active' ? 'bg-green-100 text-green-800' : 
                    event.status === 'Upcoming' ? 'bg-blue-100 text-blue-800' : 
                    'bg-gray-100 text-gray-800'}`}>
                    {event.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                    {/* <button className="p-1 text-gray-500 hover:text-black">
                      <Edit size={16} />
                    </button> */}
                    <button 
                      className="p-1 text-gray-500 hover:text-red-500"
                      onClick={() => openDeleteConfirmation(event.id, event.title, event.images && event.images.length > 0 ? event.images[0] : "/Sigiriya.jpg")}
                    >
                      <Trash2 size={16} />
                    </button>
                    <div className="relative">
                      <button 
                        className="p-1 text-gray-500 hover:text-black"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleDropdown(event.id);
                        }}
                      >
                        <MoreHorizontal size={16} />
                      </button>
                      
                      {/* Dropdown menu */}
                      {openDropdownId === event.id && (
                        <div 
                          className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="py-1">
                            {!event.isEnded ? (
                              <button
                                onClick={() => handleStatusUpdate(event.id, true)}
                                className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <X size={16} className="mr-2 text-red-500" />
                                Mark as Ended
                              </button>
                            ) : (
                              <button
                                onClick={() => handleStatusUpdate(event.id, false)}
                                className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <Check size={16} className="mr-2 text-green-500" />
                                Mark as Active
                              </button>
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
            Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredEvents.length}</span> of <span className="font-medium">{events.length}</span> results
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
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 z-50 flex items-center justify-center p-4 pt-16">
          <div 
            className="bg-white rounded-lg max-w-md w-full overflow-hidden shadow-xl" // Removed p-6, added overflow-hidden
            onClick={(e) => e.stopPropagation()}
          >
            {/* Event image at the top of the modal */}
            <div className="relative w-full h-48">
              <Image 
                src={deleteConfirmation.eventPhoto} 
                alt={deleteConfirmation.eventTitle}
                fill
                className="object-cover"
              />
              {/* Removed the black overlay div */}
            </div>
            
            <div className="p-6 pt-8">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
                <AlertTriangle size={24} className="text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-center text-gray-900 mb-2">Confirm Delete</h3>
              <p className="text-center text-gray-500 mb-6">
                Are you sure you want to delete <span className="font-medium">{deleteConfirmation.eventTitle}</span>? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={closeDeleteConfirmation}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteEvent}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Event Details Modal */}
      {isEventModalOpen && selectedEvent && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 z-50 flex items-center justify-center p-4 pt-16" onClick={closeEventModal}>
          <div 
            className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Event Images */}
            {selectedEvent.images && selectedEvent.images.length > 0 ? (
              <div className="relative w-full h-64 rounded-t-lg overflow-hidden bg-gray-200">
                <img 
                  src={selectedEvent.images[0] || "/Sigiriya.jpg"} 
                  alt={selectedEvent.title || "Event image"}
                  className="w-full h-full object-cover"
                  style={{ imageRendering: 'auto' }}
                  loading="eager"
                  onError={(e) => {
                    console.log("Image failed to load:", selectedEvent.images[0]);
                    const target = e.target as HTMLImageElement;
                    target.src = "/Sigiriya.jpg";
                  }}
                  onLoad={() => {
                    console.log("Image loaded successfully:", selectedEvent.images[0]);
                  }}
                />
                <div className="absolute top-4 right-4">
                  <button
                    onClick={closeEventModal}
                    className="bg-white rounded-full p-2 hover:bg-gray-100 shadow-lg"
                  >
                    <X size={20} className="text-gray-600" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative w-full h-64 rounded-t-lg overflow-hidden bg-gray-200 flex items-center justify-center">
                <div className="text-gray-500">No image available</div>
                <div className="absolute top-4 right-4">
                  <button
                    onClick={closeEventModal}
                    className="bg-white rounded-full p-2 hover:bg-gray-100 shadow-lg"
                  >
                    <X size={20} className="text-gray-600" />
                  </button>
                </div>
              </div>
            )}
            
            <div className="p-6 pt-8">
              {/* Event Header */}
              <div className="mb-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-black mb-2">{selectedEvent.title}</h2>
                    <div className="flex items-center text-gray-600 mb-2">
                      <MapPin size={16} className="mr-2" />
                      <span>{selectedEvent.location}</span>
                    </div>
                    <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full 
                      ${selectedEvent.status === 'Active' ? 'bg-green-100 text-green-800' : 
                      selectedEvent.status === 'Upcoming' ? 'bg-blue-100 text-blue-800' : 
                      'bg-gray-100 text-gray-800'}`}>
                      {selectedEvent.status}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-black">LKR {selectedEvent.price}</div>
                    <div className="text-sm text-gray-500">per person</div>
                  </div>
                </div>
              </div>

              {/* Event Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-black mb-3">Event Information</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-600 text-sm">Date & Time:</span>
                      <p className="font-medium">{new Date(selectedEvent.date).toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 text-sm">Category:</span>
                      <p className="font-medium">{selectedEvent.category}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 text-sm">Organizer:</span>
                      <p className="font-medium">{selectedEvent.organizerName}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 text-sm">Participants:</span>
                      <p className="font-medium flex items-center">
                        <Users size={16} className="mr-1" /> {selectedEvent.participantsCount}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-black mb-3">Admin Information</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-600 text-sm">Event ID:</span>
                      <p className="font-medium font-mono text-xs">{selectedEvent.id}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 text-sm">Created:</span>
                      <p className="font-medium">{new Date(selectedEvent.createdAt).toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 text-sm">Last Updated:</span>
                      <p className="font-medium">{new Date(selectedEvent.updatedAt).toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 text-sm">Status:</span>
                      <p className="font-medium">{selectedEvent.isEnded ? 'Event Ended' : 'Active Event'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Event Description */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-black mb-3">Description</h3>
                <p className="text-gray-700 leading-relaxed">{selectedEvent.description}</p>
              </div>

              {/* Event Images Gallery */}
              {selectedEvent.images && selectedEvent.images.length > 1 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-black mb-3">Gallery</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedEvent.images.map((image: string, index: number) => (
                      <div key={index} className="relative h-32 rounded-lg overflow-hidden">
                        <img 
                          src={image} 
                          alt={`${selectedEvent.title} - Image ${index + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                          style={{ imageRendering: 'auto' }}
                          loading="lazy"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Location Details */}
              {selectedEvent.latitude && selectedEvent.longitude && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-black mb-3">Location</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">Coordinates:</p>
                    <p className="font-mono text-sm">
                      Lat: {selectedEvent.latitude}, Lng: {selectedEvent.longitude}
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end">
                <button
                  onClick={closeEventModal}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    openDeleteConfirmation(
                      selectedEvent.id, 
                      selectedEvent.title, 
                      selectedEvent.images && selectedEvent.images.length > 0 ? selectedEvent.images[0] : "/Sigiriya.jpg"
                    );
                    closeEventModal();
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none"
                >
                  Delete Event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}