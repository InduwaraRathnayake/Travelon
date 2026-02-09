"use client";

import React, { useState } from "react";
import { CheckCircle, XCircle, Calendar, Users, X, Info } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface Payment {
  id: string;
  eventName: string;
  participantCount: number;
  ticketPrice: number;
  paymentStatus: "Completed" | "Pending" | "Ongoing";
  createdAt: string;
  images: string[];
}

import { useEffect } from "react";

const statusStyles: Record<string, string> = {
  Completed: "bg-green-50 text-green-700 border-green-200",
  Pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  Ongoing: "bg-blue-50 text-blue-700 border-blue-200",
};

const PaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showBankNotification, setShowBankNotification] = useState(true);
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true); // Set loading to true before fetching data
        const res = await fetch("/api/organizer/payments");
        if (!res.ok) throw new Error("Failed to fetch payments");
        const data = await res.json();
        setPayments(Array.isArray(data.payments) ? data.payments : []);
      } catch (err) {
        console.error("Error fetching payments:", err);
        setPayments([]);
      } finally {
        setLoading(false); // Set loading to false after fetching completes
      }
    };
    fetchPayments();
  }, []);

  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Sort and filter payments
  const sortedPayments = payments.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  const filteredPayments = sortedPayments.filter((payment) => {
    if (filterStatus === "all") return true;
    if (filterStatus === "ongoing") return payment.paymentStatus === "Ongoing";
    return payment.paymentStatus.toLowerCase() === filterStatus;
  });

  // Modal state
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedOngoing, setSelectedOngoing] = useState<string>("");

  // Get ongoing payments
  const ongoingPayments = sortedPayments.filter(
    (p) => p.paymentStatus === "Ongoing",
  );

  // Display loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
        <p className="mt-4 text-gray-600">Loading your payment history...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-0">
      {/* Bank details notification */}
      {showBankNotification && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 relative">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <Info className="h-5 w-5 text-blue-600" aria-hidden="true" />
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm text-blue-700">
                Please add your bank details in your profile before requesting
                any payments.
                <Link
                  href="/organizer/profile"
                  className="font-medium underline ml-1"
                >
                  Update your profile
                </Link>
                . If you have already added your bank details, please ignore
                this message.
              </p>
            </div>
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button
                  type="button"
                  onClick={() => setShowBankNotification(false)}
                  className="inline-flex rounded-md bg-blue-50 p-1.5 text-blue-500 hover:bg-blue-100 focus:outline-none"
                >
                  <span className="sr-only">Dismiss</span>
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 flex items-center gap-2">
          <Calendar size={20} className="text-black sm:hidden" />
          <Calendar size={28} className="text-black hidden sm:block" /> Payments
        </h1>
      </div>

      {/* Filter dropdown and Request Payment button responsive layout */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 bg-white rounded-lg shadow border border-gray-200 px-3 sm:px-4 py-2 w-full sm:w-auto">
          <label
            htmlFor="status-filter"
            className="text-sm font-medium text-black"
          >
            Filter by status:
          </label>
          <select
            id="status-filter"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-2 sm:px-3 py-2 bg-white text-black focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 outline-none text-sm"
          >
            <option value="all">All</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="ongoing">Ongoing</option>
          </select>
        </div>
        <button
          className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 outline-none text-sm sm:text-base whitespace-nowrap"
          onClick={() => setShowModal(true)}
        >
          Request Payment
        </button>
      </div>

      {/* Modal for requesting payment */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{
            background: "rgba(255,255,255,0.5)",
            backdropFilter: "blur(8px)",
          }}
        >
          <div className="bg-white/80 rounded-2xl shadow-2xl p-4 sm:p-8 min-w-[300px] w-full max-w-md mx-4 sm:mx-0 border border-gray-200">
            <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 text-gray-900">
              Request Payment
            </h2>
            <label
              htmlFor="ongoing-select"
              className="block text-sm font-medium text-gray-700 mb-3"
            >
              Select Ongoing Payment:
            </label>
            <select
              id="ongoing-select"
              value={selectedOngoing}
              onChange={(e) => setSelectedOngoing(e.target.value)}
              className="border border-gray-300 rounded-lg px-2 sm:px-3 py-2 w-full bg-white text-gray-900 focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 outline-none mb-4 sm:mb-6 text-sm"
            >
              <option value="">Select...</option>
              {ongoingPayments.map((p, idx) => (
                <option key={idx} value={p.id}>
                  {`${p.eventName} |  ${p.participantCount} participants | Rs${
                    p.ticketPrice
                  }| Rs${p.ticketPrice * p.participantCount}`}
                </option>
              ))}
            </select>
            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
              <button
                className="border border-gray-300 rounded-lg px-3 sm:px-4 py-2 bg-white text-gray-900 font-semibold hover:bg-gray-50 focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 outline-none text-sm sm:text-base"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="border border-gray-300 rounded-lg px-3 sm:px-4 py-2 bg-black text-white font-semibold hover:bg-gray-800 focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 outline-none text-sm sm:text-base"
                disabled={!selectedOngoing}
                onClick={async () => {
                  try {
                    // Send PATCH request to update payment status
                    const res = await fetch("/api/organizer/payments", {
                      method: "PATCH",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({ eventId: selectedOngoing }),
                    });

                    if (!res.ok) {
                      throw new Error("Failed to update payment status");
                    }

                    // Refresh payments after successful update
                    const fetchRes = await fetch("/api/organizer/payments");
                    if (fetchRes.ok) {
                      const data = await fetchRes.json();
                      setPayments(
                        Array.isArray(data.payments) ? data.payments : [],
                      );
                    }

                    // Close modal
                    setShowModal(false);
                  } catch (error) {
                    console.error("Error updating payment status:", error);
                    alert("Failed to request payment. Please try again.");
                  }
                }}
              >
                Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Display empty state if no payments are available */}
      {!loading && filteredPayments.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-12 text-center">
          <Calendar
            size={32}
            className="mx-auto text-gray-400 mb-4 sm:hidden"
          />
          <Calendar
            size={48}
            className="mx-auto text-gray-400 mb-4 hidden sm:block"
          />
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
            No payments found
          </h3>
          <p className="text-sm sm:text-base text-gray-500 mb-4 sm:mb-6">
            {filterStatus === "all"
              ? "You don't have any payments yet."
              : `You don't have any ${filterStatus} payments.`}
          </p>
          <Link
            href="/organizer/create-event"
            className="inline-flex items-center px-3 sm:px-4 py-2 border border-gray-300 rounded-md bg-black text-white hover:bg-gray-800 transition-all text-sm sm:text-base"
          >
            Create an event to get started
          </Link>
        </div>
      )}

      {/* Display payment table/cards if there are payments */}
      {!loading && filteredPayments.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-6">
          {/* Desktop Table View */}
          <div className="hidden lg:block">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-100 text-gray-700 text-sm">
                  <th className="py-3 px-4 text-left font-semibold">Photo</th>
                  <th className="py-3 px-4 text-left font-semibold">
                    Event Name
                  </th>
                  <th className="py-3 px-4 text-center font-semibold">Date</th>
                  <th className="py-3 px-4 text-center font-semibold">
                    Participants
                  </th>
                  <th className="py-3 px-4 text-center font-semibold">
                    Ticket Price ($)
                  </th>
                  <th className="py-3 px-4 text-center font-semibold">
                    Status
                  </th>
                  <th className="py-3 px-4 text-center font-semibold">
                    Total Payment ($)
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment, idx) => (
                  <tr
                    key={idx}
                    className="border-b last:border-b-0 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="h-12 w-12 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                        <Image
                          src={
                            payment.images && payment.images.length > 0
                              ? payment.images[0]
                              : "/SriLanks.webp"
                          }
                          alt={payment.eventName}
                          width={48}
                          height={48}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    </td>
                    <td className="py-3 px-4 flex items-center gap-2">
                      <Users size={18} className="text-gray-400" />
                      <span className="font-medium text-gray-800">
                        {payment.eventName}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center text-gray-700">
                      {formatDate(payment.createdAt)}
                    </td>
                    <td className="py-3 px-4 text-center text-gray-700 font-semibold">
                      {payment.participantCount}
                    </td>
                    <td className="py-3 px-4 text-center text-gray-700">
                      {payment.ticketPrice}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border text-xs font-medium ${
                          statusStyles[payment.paymentStatus]
                        }`}
                      >
                        {payment.paymentStatus === "Completed" ? (
                          <CheckCircle size={14} className="text-green-500" />
                        ) : payment.paymentStatus === "Pending" ? (
                          <XCircle size={14} className="text-yellow-500" />
                        ) : (
                          <span className="w-3 h-3 rounded-full bg-blue-400 inline-block mr-1"></span>
                        )}
                        {payment.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-black">
                      {payment.ticketPrice * payment.participantCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="block lg:hidden space-y-4">
            {filteredPayments.map((payment, idx) => (
              <div
                key={idx}
                className="border border-gray-200 rounded-lg p-4 space-y-3"
              >
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                    <Image
                      src={
                        payment.images && payment.images.length > 0
                          ? payment.images[0]
                          : "/SriLanks.webp"
                      }
                      alt={payment.eventName}
                      width={48}
                      height={48}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Users size={16} className="text-gray-400" />
                      <span className="font-medium text-gray-800 text-sm">
                        {payment.eventName}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDate(payment.createdAt)}
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border text-xs font-medium ${
                      statusStyles[payment.paymentStatus]
                    }`}
                  >
                    {payment.paymentStatus === "Completed" ? (
                      <CheckCircle size={12} className="text-green-500" />
                    ) : payment.paymentStatus === "Pending" ? (
                      <XCircle size={12} className="text-yellow-500" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-blue-400 inline-block mr-1"></span>
                    )}
                    {payment.paymentStatus}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500 text-xs">Participants</div>
                    <div className="font-semibold">
                      {payment.participantCount}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500 text-xs">Ticket Price</div>
                    <div>${payment.ticketPrice}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 text-xs">Total</div>
                    <div className="font-bold">
                      ${payment.ticketPrice * payment.participantCount}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsPage;
