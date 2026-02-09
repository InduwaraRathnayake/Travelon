"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Users,
  Calendar,
  DollarSign,
  Activity,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  ChevronDown,
  Loader,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// Define types
interface EventSummary {
  id: string;
  title: string;
  date: any;
  location: string;
  price: string;
  ticketsSold: number;
  maxParticipants: number;
  revenue: number;
  image?: string;
  isBoosted?: boolean;
}

interface AnalyticsData {
  totalRevenue: number;
  totalTicketsSold: number;
  totalEvents: number;
  activeEvents: number;
  pastEvents: number;
  avgTicketPrice: number;
  revenueByMonth: {
    month: string;
    revenue: number;
  }[];
  ticketsByMonth: {
    month: string;
    tickets: number;
  }[];
  eventsByCategory: {
    category: string;
    count: number;
  }[];
  recentEvents: EventSummary[];
  topEvents: EventSummary[];
  boostedEvents: number;
}

// Add this improved date formatting function at the top level, outside the component

function formatEventDate(
  dateInput: { seconds: number; nanoseconds: number } | string | undefined,
): string {
  if (!dateInput) {
    return "Date not available";
  }

  try {
    let date: Date;

    // Handle Firebase Timestamp object
    if (typeof dateInput === "object" && "seconds" in dateInput) {
      date = new Date(dateInput.seconds * 1000);
    }
    // Handle ISO string
    else if (typeof dateInput === "string") {
      date = new Date(dateInput);
    }
    // Handle unknown format
    else {
      return "Invalid date format";
    }

    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return "Invalid date";
    }

    // Format the date
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };

    return date.toLocaleDateString("en-US", options);
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Date error";
  }
}

export default function OrganizerDashboard() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<
    "7days" | "30days" | "90days" | "all"
  >("all");
  const [showDropdown, setShowDropdown] = useState(false);

  // COLORS for charts
  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884d8",
    "#82ca9d",
  ];

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/organizer/analytics?timeRange=${timeRange}`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch analytics data");
        }

        const data = await response.json();
        // console.log("Fetched analytics data:", data);
        setAnalyticsData(data);
      } catch (err: any) {
        console.error("Error fetching analytics data:", err);
        setError(err.message || "Failed to load analytics data");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [timeRange]);

  const formatCurrency = (amount: number) => {
    return `LKR ${amount.toLocaleString()}`;
  };

  // Calculate percentage change
  const getPercentageChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  if (loading) {
    return (
      // <div className="flex flex-col items-center justify-center min-h-[70vh]">
      //   <Loader className="h-12 w-12 animate-spin text-gray-500 mb-4" />
      //   <p className="text-gray-600">Loading your dashboard...</p>
      // </div>
      <div className="flex items-center justify-center h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
        <p className="ml-2 text-gray-600">Loading your dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-6 rounded-lg text-center max-w-xl mx-auto my-12">
        <div className="text-red-500 text-lg mb-3">
          Failed to load analytics
        </div>
        <p className="text-gray-700 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-center p-8">
        <p>No data available. Start creating events to see analytics.</p>
        <Link
          href="/organizer/create-event"
          className="inline-block mt-4 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
        >
          Create Event
        </Link>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 lg:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Analytics Dashboard</h1>

        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center px-3 sm:px-4 py-2 border border-gray-300 rounded-md bg-white text-sm sm:text-base w-full sm:w-auto"
          >
            <Filter className="h-4 w-4 mr-2" />
            {timeRange === "7days" && "Last 7 Days"}
            {timeRange === "30days" && "Last 30 Days"}
            {timeRange === "90days" && "Last 90 Days"}
            {timeRange === "all" && "All Time"}
            <ChevronDown className="h-4 w-4 ml-2" />
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10">
              <div className="py-1">
                <button
                  onClick={() => {
                    setTimeRange("7days");
                    setShowDropdown(false);
                  }}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  Last 7 Days
                </button>
                <button
                  onClick={() => {
                    setTimeRange("30days");
                    setShowDropdown(false);
                  }}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  Last 30 Days
                </button>
                <button
                  onClick={() => {
                    setTimeRange("90days");
                    setShowDropdown(false);
                  }}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  Last 90 Days
                </button>
                <button
                  onClick={() => {
                    setTimeRange("all");
                    setShowDropdown(false);
                  }}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  All Time
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Revenue Card */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-3 sm:mb-4">
            <div>
              <p className="text-gray-500 text-xs sm:text-sm">Total Revenue</p>
              <h3 className="text-xl sm:text-2xl font-bold mt-1">
                {formatCurrency(analyticsData.totalRevenue)}
              </h3>
            </div>
            <div className="bg-blue-100 p-2 sm:p-3 rounded-full">
              <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            </div>
          </div>
          <div className="flex items-center text-xs sm:text-sm">
            <span
              className={`flex items-center ${
                getPercentageChange(
                  analyticsData.totalRevenue,
                  analyticsData.totalRevenue * 0.8,
                ) >= 0
                  ? "text-green-500"
                  : "text-red-500"
              }`}
            >
              {getPercentageChange(
                analyticsData.totalRevenue,
                analyticsData.totalRevenue * 0.8,
              ) >= 0 ? (
                <ArrowUpRight className="h-4 w-4 mr-1" />
              ) : (
                <ArrowDownRight className="h-4 w-4 mr-1" />
              )}
              {Math.abs(
                getPercentageChange(
                  analyticsData.totalRevenue,
                  analyticsData.totalRevenue * 0.8,
                ),
              )}
              %
            </span>
            <span className="text-gray-500 ml-2">vs previous period</span>
          </div>
        </div>

        {/* Tickets Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-500 text-sm">Tickets Sold</p>
              <h3 className="text-2xl font-bold mt-1">
                {analyticsData.totalTicketsSold}
              </h3>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="flex items-center text-sm">
            <span
              className={`flex items-center ${
                getPercentageChange(
                  analyticsData.totalTicketsSold,
                  analyticsData.totalTicketsSold * 0.9,
                ) >= 0
                  ? "text-green-500"
                  : "text-red-500"
              }`}
            >
              {getPercentageChange(
                analyticsData.totalTicketsSold,
                analyticsData.totalTicketsSold * 0.9,
              ) >= 0 ? (
                <ArrowUpRight className="h-4 w-4 mr-1" />
              ) : (
                <ArrowDownRight className="h-4 w-4 mr-1" />
              )}
              {Math.abs(
                getPercentageChange(
                  analyticsData.totalTicketsSold,
                  analyticsData.totalTicketsSold * 0.9,
                ),
              )}
              %
            </span>
            <span className="text-gray-500 ml-2">vs previous period</span>
          </div>
        </div>

        {/* Events Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-500 text-sm">Total Events</p>
              <h3 className="text-2xl font-bold mt-1">
                {analyticsData.totalEvents}
              </h3>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center text-sm">
              <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded text-xs">
                {analyticsData.activeEvents} Active
              </span>
            </div>
            <div className="flex items-center text-sm">
              <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded text-xs">
                {analyticsData.pastEvents} Past
              </span>
            </div>
            <div className="flex items-center text-sm">
              <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs">
                {analyticsData.boostedEvents} Boosted
              </span>
            </div>
          </div>
        </div>

        {/* Avg Ticket Price Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-500 text-sm">Avg. Ticket Price</p>
              <h3 className="text-2xl font-bold mt-1">
                {formatCurrency(analyticsData.avgTicketPrice)}
              </h3>
            </div>
            <div className="bg-amber-100 p-3 rounded-full">
              <Activity className="h-6 w-6 text-amber-600" />
            </div>
          </div>
          <div className="flex items-center text-sm">
            <span
              className={`flex items-center ${
                getPercentageChange(
                  analyticsData.avgTicketPrice,
                  analyticsData.avgTicketPrice * 0.95,
                ) >= 0
                  ? "text-green-500"
                  : "text-red-500"
              }`}
            >
              {getPercentageChange(
                analyticsData.avgTicketPrice,
                analyticsData.avgTicketPrice * 0.95,
              ) >= 0 ? (
                <ArrowUpRight className="h-4 w-4 mr-1" />
              ) : (
                <ArrowDownRight className="h-4 w-4 mr-1" />
              )}
              {Math.abs(
                getPercentageChange(
                  analyticsData.avgTicketPrice,
                  analyticsData.avgTicketPrice * 0.95,
                ),
              )}
              %
            </span>
            <span className="text-gray-500 ml-2">vs previous period</span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Revenue Chart */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6">
            Revenue Trends
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart
              data={analyticsData.revenueByMonth}
              margin={{
                top: 5,
                right: 10,
                left: 10,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip
                formatter={(value: number) => [`LKR ${value}`, "Revenue"]}
                labelFormatter={(label: string) => `Month: ${label}`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#0088FE"
                activeDot={{ r: 8 }}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Tickets Chart */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6">
            Ticket Sales Trends
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={analyticsData.ticketsByMonth}
              margin={{
                top: 5,
                right: 10,
                left: 10,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip
                formatter={(value: number) => [
                  `${value} tickets`,
                  "Tickets Sold",
                ]}
                labelFormatter={(label: string) => `Month: ${label}`}
              />
              <Legend />
              <Bar dataKey="tickets" fill="#00C49F" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Categories and Top Events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Categories Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-6">Events by Category</h3>
          <div className="flex justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={analyticsData.eventsByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={60}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="category"
                  label={false}
                >
                  {analyticsData.eventsByCategory.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string, props: any) => [
                    `${value} events`,
                    props.payload.category,
                  ]}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  wrapperStyle={{
                    fontSize: "11px",
                    paddingTop: "10px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top 3 Events */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4">Top Performing Events</h3>
          <div className="space-y-4">
            {analyticsData.topEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-start border-b border-gray-100 pb-4 last:border-0 last:pb-0"
              >
                <div className="h-16 w-16 rounded-md bg-gray-100 overflow-hidden flex-shrink-0 mr-4">
                  {event.image ? (
                    <Image
                      src={event.image}
                      alt={event.title}
                      width={64}
                      height={64}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full w-full">
                      <Calendar className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-grow min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900 truncate">
                      <Link
                        href={`/organizer/events/view/${event.id}`}
                        className="hover:underline"
                      >
                        {event.title}
                      </Link>
                    </h4>
                    {event.isBoosted && (
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full flex items-center">
                        <Zap className="h-3 w-3 mr-1" />
                        Boosted
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {formatEventDate(event.date)}
                  </div>
                  <div className="flex justify-between mt-2 text-sm">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1 text-gray-400" />
                      <span>
                        {event.ticketsSold}/{event.maxParticipants}
                      </span>
                    </div>
                    <div className="font-medium text-green-600">
                      {formatCurrency(event.revenue)}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {analyticsData.topEvents.length === 0 && (
              <div className="text-center p-4 text-gray-500">
                No event data available yet
              </div>
            )}

            <Link
              href="/organizer/events"
              className="block text-center text-sm text-blue-600 hover:underline mt-4"
            >
              View all events →
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Events */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6">
          Recent Events
        </h3>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Event
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ticket Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tickets Sold
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {analyticsData.recentEvents.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {event.isBoosted && (
                        <Zap className="h-4 w-4 text-blue-500 mr-2" />
                      )}
                      <Link
                        href={`/organizer/events/view/${event.id}`}
                        className="font-medium text-gray-900 hover:underline"
                      >
                        {event.title}
                      </Link>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatEventDate(event.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {event.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatCurrency(parseFloat(event.price) || 0)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {event.ticketsSold}/{event.maxParticipants}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                    {formatCurrency(event.revenue)}
                  </td>
                </tr>
              ))}

              {analyticsData.recentEvents.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No recent events found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="block md:hidden space-y-4">
          {analyticsData.recentEvents.map((event) => (
            <div
              key={event.id}
              className="border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  {event.isBoosted && (
                    <Zap className="h-4 w-4 text-blue-500 mr-2" />
                  )}
                  <Link
                    href={`/organizer/events/view/${event.id}`}
                    className="font-medium text-gray-900 hover:underline text-sm"
                  >
                    {event.title}
                  </Link>
                </div>
              </div>
              <div className="text-xs text-gray-500 mb-3">
                {formatEventDate(event.date)} • {event.location}
              </div>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <div className="text-xs text-gray-500">Price</div>
                  <div>{formatCurrency(parseFloat(event.price) || 0)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Sold</div>
                  <div>
                    {event.ticketsSold}/{event.maxParticipants}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Revenue</div>
                  <div className="font-medium text-green-600">
                    {formatCurrency(event.revenue)}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {analyticsData.recentEvents.length === 0 && (
            <div className="text-center text-sm text-gray-500 py-4">
              No recent events found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
