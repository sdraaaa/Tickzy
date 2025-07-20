import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Calendar, TrendingUp, Clock, CheckCircle, X, AlertCircle } from 'lucide-react';
import { Event } from '@/services/eventsService';
import { EventApprovalStats } from '@/services/adminService';
import EventStatusBadge from '../Events/EventStatusBadge';

interface EventAnalyticsProps {
  events: Event[];
  stats?: EventApprovalStats;
  timeRange?: 'week' | 'month' | 'quarter' | 'year';
}

const EventAnalytics: React.FC<EventAnalyticsProps> = ({ 
  events, 
  stats,
  timeRange = 'month' 
}) => {
  const [selectedMetric, setSelectedMetric] = useState<'status' | 'category' | 'timeline'>('status');

  // Process events data for analytics
  const processEventData = () => {
    // Status distribution
    const statusData = [
      { name: 'Approved', value: events.filter(e => e.status === 'approved').length, color: '#10B981' },
      { name: 'Pending', value: events.filter(e => e.status === 'pending').length, color: '#F59E0B' },
      { name: 'Rejected', value: events.filter(e => e.status === 'rejected').length, color: '#EF4444' },
      { name: 'Cancelled', value: events.filter(e => e.status === 'cancelled').length, color: '#6B7280' }
    ].filter(item => item.value > 0);

    // Category distribution
    const categoryData = events.reduce((acc, event) => {
      const category = event.category || 'Other';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const categoryChartData = Object.entries(categoryData).map(([name, value]) => ({
      name,
      value,
      color: getRandomColor()
    }));

    // Timeline data (events created over time)
    const timelineData = events.reduce((acc, event) => {
      const date = new Date(event.createdAt);
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
      acc[monthYear] = (acc[monthYear] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const timelineChartData = Object.entries(timelineData)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .map(([date, count]) => ({
        date,
        events: count
      }));

    return {
      statusData,
      categoryChartData,
      timelineChartData
    };
  };

  const getRandomColor = () => {
    const colors = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#8B5A2B', '#EC4899'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const { statusData, categoryChartData, timelineChartData } = processEventData();

  // Calculate key metrics
  const totalEvents = events.length;
  const approvalRate = totalEvents > 0 ? (events.filter(e => e.status === 'approved').length / totalEvents * 100) : 0;
  const avgEventsPerDay = totalEvents > 0 ? (totalEvents / 30) : 0; // Assuming 30-day period
  const pendingCount = events.filter(e => e.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{totalEvents}</p>
              <p className="text-gray-600 text-sm">Total Events</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{approvalRate.toFixed(1)}%</p>
              <p className="text-gray-600 text-sm">Approval Rate</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
              <p className="text-gray-600 text-sm">Pending Review</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{avgEventsPerDay.toFixed(1)}</p>
              <p className="text-gray-600 text-sm">Events/Day</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Selection */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Event Analytics</h3>
          <div className="flex space-x-2 mt-4 sm:mt-0">
            <button
              onClick={() => setSelectedMetric('status')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedMetric === 'status'
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Status
            </button>
            <button
              onClick={() => setSelectedMetric('category')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedMetric === 'category'
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Category
            </button>
            <button
              onClick={() => setSelectedMetric('timeline')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedMetric === 'timeline'
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Timeline
            </button>
          </div>
        </div>

        {/* Charts */}
        <div className="h-80">
          {selectedMetric === 'status' && (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}

          {selectedMetric === 'category' && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          )}

          {selectedMetric === 'timeline' && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="events" stroke="#06B6D4" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent Events Table */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Events</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Event</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Category</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Created</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {events.slice(0, 10).map((event) => (
                <tr key={event.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-10 h-10 rounded-lg object-cover mr-3"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=400';
                        }}
                      />
                      <div>
                        <p className="font-medium text-gray-900">{event.title}</p>
                        <p className="text-sm text-gray-600">{event.location}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{event.category}</td>
                  <td className="py-3 px-4">
                    <EventStatusBadge status={event.status as any} size="sm" />
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {new Date(event.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-gray-600">${event.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EventAnalytics;
