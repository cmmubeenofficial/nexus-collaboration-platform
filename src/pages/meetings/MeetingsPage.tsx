import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Meeting, AvailabilitySlot } from '../../types';
import { getMeetingsForUser, getAvailabilityForUser, updateMeetingStatus } from '../../data/meetings';
import { MeetingRequests } from '../../components/meetings/MeetingRequests';
import { AvailabilityManager } from '../../components/meetings/AvailabilityManager';
import { format, isAfter, isToday, isTomorrow, parseISO, isSameDay } from 'date-fns';
import { Calendar as CalendarIcon, Clock, User, Video, ChevronRight, CheckCircle2 } from 'lucide-react';
import { findUserById } from '../../data/users';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../../styles/calendar.css';

export const MeetingsPage: React.FC = () => {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  useEffect(() => {
    if (user) {
      setMeetings(getMeetingsForUser(user.id));
      setAvailability(getAvailabilityForUser(user.id));
    }
  }, [user]);

  if (!user) return null;

  const pendingRequests = meetings.filter(m => m.status === 'pending' && m.receiverId === user.id);
  const confirmedMeetings = meetings.filter(m => m.status === 'confirmed');

  // Find next meeting
  const now = new Date();
  const upcomingMeetings = confirmedMeetings
    .filter(m => isAfter(parseISO(`${m.date}T${m.startTime}`), now))
    .sort((a, b) => new Date(`${a.date}T${a.startTime}`).getTime() - new Date(`${b.date}T${b.startTime}`).getTime());
  
  const nextMeeting = upcomingMeetings.length > 0 ? upcomingMeetings[0] : null;

  const handleAcceptRequest = (id: string) => {
    updateMeetingStatus(id, 'confirmed');
    setMeetings(getMeetingsForUser(user.id));
  };

  const handleDeclineRequest = (id: string) => {
    updateMeetingStatus(id, 'declined');
    setMeetings(getMeetingsForUser(user.id));
  };

  const renderCurrentDateContext = (dateString: string) => {
    const date = parseISO(dateString);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MMM d, yyyy');
  };

  // Calendar helpers
  const getMeetingsForDate = (date: Date) => {
    return meetings.filter(m => isSameDay(parseISO(m.date), date));
  };

  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view !== 'month') return null;
    const dayMeetings = getMeetingsForDate(date);
    if (dayMeetings.length === 0) return null;
    const hasConfirmed = dayMeetings.some(m => m.status === 'confirmed');
    const hasPending = dayMeetings.some(m => m.status === 'pending');
    return (
      <div className="flex justify-center gap-0.5">
        {hasConfirmed && <span className="meeting-dot meeting-dot--confirmed" />}
        {hasPending && <span className="meeting-dot meeting-dot--pending" />}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Meeting Scheduler</h1>
          <p className="text-gray-500 mt-1">Manage your calendar, availability, and requests</p>
        </div>
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
          <CalendarIcon className="text-indigo-600" size={20} />
          <span className="font-medium text-gray-700">{format(now, 'MMMM yyyy')}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        
        {/* Left Column: Schedule & Upcoming */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Next Meeting Banner */}
          {nextMeeting ? (
            <div className="bg-gradient-to-r from-indigo-600 to-blue-700 rounded-xl shadow-md text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 text-white opacity-10">
                <CalendarIcon size={120} />
              </div>
              <div className="p-6 sm:p-8 relative z-10">
                <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium mb-4">
                  <Clock size={14} /> Upcoming in Next Meeting
                </div>
                
                <h2 className="text-2xl sm:text-3xl font-bold mb-2">{nextMeeting.title}</h2>
                <p className="text-indigo-100 text-sm sm:text-base max-w-xl mb-6 line-clamp-2">
                  {nextMeeting.description}
                </p>
                
                <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <CalendarIcon size={18} className="text-indigo-200" />
                    <span className="font-medium">{renderCurrentDateContext(nextMeeting.date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={18} className="text-indigo-200" />
                    <span className="font-medium">{nextMeeting.startTime} - {nextMeeting.endTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User size={18} className="text-indigo-200" />
                    <span className="font-medium">
                      With {findUserById(nextMeeting.requesterId === user.id ? nextMeeting.receiverId : nextMeeting.requesterId)?.name}
                    </span>
                  </div>
                </div>
                
                <div className="mt-6 flex gap-3">
                  <button className="bg-white text-indigo-700 hover:bg-indigo-50 px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2">
                    <Video size={16} /> Join Call
                  </button>
                  <button className="bg-indigo-800/40 hover:bg-indigo-800/60 text-white border border-indigo-400/30 px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2">
                    Reschedule
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center flex flex-col items-center justify-center min-h-[200px]">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <CalendarIcon size={28} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No upcoming meetings</h3>
              <p className="text-gray-500 mt-1 text-sm max-w-sm">Your schedule is clear. Check your pending requests or update your availability.</p>
            </div>
          )}

          {/* All Confirmed Meetings */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <CheckCircle2 size={20} className="text-green-500" /> Confirmed Meetings
              </h2>
              <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full text-xs font-medium">
                {confirmedMeetings.length}
              </span>
            </div>
            
            <div className="divide-y divide-gray-100">
              {confirmedMeetings.length > 0 ? (
                confirmedMeetings.map(meeting => {
                  const partner = findUserById(meeting.requesterId === user.id ? meeting.receiverId : meeting.requesterId);
                  
                  return (
                    <div key={meeting.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row sm:items-center gap-4">
                      
                      <div className="flex-shrink-0 flex flex-col items-center justify-center w-16 h-16 bg-indigo-50 rounded-lg border border-indigo-100/50">
                        <span className="text-xs font-semibold text-indigo-500 uppercase">
                          {format(parseISO(`${meeting.date}T${meeting.startTime}`), 'MMM')}
                        </span>
                        <span className="text-xl font-bold text-indigo-700">
                          {format(parseISO(`${meeting.date}T${meeting.startTime}`), 'd')}
                        </span>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="text-base font-medium text-gray-900 truncate">{meeting.title}</h4>
                        <div className="flex items-center gap-2 mt-1 truncate">
                          <span className="text-sm font-medium text-indigo-600">{partner?.name}</span>
                          <span className="text-gray-300">•</span>
                          <span className="text-sm text-gray-500 truncate">{partner?.role}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 mt-2 sm:mt-0 text-gray-500 text-sm">
                        <div className="flex items-center gap-1.5 bg-white border border-gray-200 px-2.5 py-1 rounded-md shadow-sm">
                          <Clock size={14} className="text-gray-400" />
                          <span>{meeting.startTime} - {meeting.endTime}</span>
                        </div>
                        <button className="text-indigo-600 hover:text-indigo-800 font-medium text-sm flex items-center gap-1 transition-colors group">
                          Details <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      </div>
                      
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-gray-500 text-sm">
                  You don't have any confirmed meetings scheduled.
                </div>
              )}
            </div>
          </div>
          
        </div>
        
        {/* Right Column: Calendar, Requests & Availability */}
        <div className="space-y-6">
          {/* Calendar Widget */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center gap-2">
              <CalendarIcon size={20} className="text-indigo-600" />
              <h2 className="text-lg font-semibold text-gray-900">Calendar</h2>
            </div>
            <div className="p-4">
              <Calendar
                onChange={(value) => setSelectedDate(value as Date)}
                value={selectedDate}
                tileContent={tileContent}
              />
              {/* Selected date meetings */}
              {getMeetingsForDate(selectedDate).length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                    {format(selectedDate, 'MMM d')} — {getMeetingsForDate(selectedDate).length} meeting(s)
                  </h4>
                  <div className="space-y-2">
                    {getMeetingsForDate(selectedDate).map(m => (
                      <div key={m.id} className="flex items-center gap-2 text-sm p-2 rounded-lg bg-gray-50">
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          m.status === 'confirmed' ? 'bg-green-500' : m.status === 'pending' ? 'bg-amber-500' : 'bg-red-400'
                        }`} />
                        <span className="truncate font-medium text-gray-800">{m.title}</span>
                        <span className="text-gray-400 text-xs ml-auto whitespace-nowrap">{m.startTime}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Meeting Requests</h2>
              {pendingRequests.length > 0 && (
                <span className="bg-red-100 text-red-600 px-2.5 py-1 rounded-full text-xs font-bold animate-pulse">
                  {pendingRequests.length} New
                </span>
              )}
            </div>
            <div className="p-4 sm:p-5">
              <MeetingRequests 
                userId={user.id}
                requests={pendingRequests}
                onAccept={handleAcceptRequest}
                onDecline={handleDeclineRequest}
              />
            </div>
          </div>

          <AvailabilityManager 
            userId={user.id}
            initialSlots={availability}
          />
        </div>
        
      </div>
    </div>
  );
};
