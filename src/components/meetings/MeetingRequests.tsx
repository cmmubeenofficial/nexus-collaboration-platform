import React from 'react';
import { Meeting } from '../../types';
import { Button } from '../ui/Button';
import { Check, X, Calendar as CalendarIcon, Clock, User } from 'lucide-react';
import { format } from 'date-fns';
import { findUserById } from '../../data/users';

interface MeetingRequestsProps {
  userId: string;
  requests: Meeting[];
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
}

export const MeetingRequests: React.FC<MeetingRequestsProps> = ({ 
  requests, 
  onAccept, 
  onDecline 
}) => {
  if (requests.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center text-gray-500">
        No pending meeting requests.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Meeting Requests</h2>
      {requests.map((request) => {
        const requester = findUserById(request.requesterId);
        
        return (
          <div key={request.id} className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-5 transition-all hover:shadow-md">
            {/* User info */}
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-700">
                <User size={12} />
              </span>
              <span className="font-medium text-gray-900">{requester?.name || 'Unknown User'}</span>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                {requester?.role || 'User'}
              </span>
            </div>

            {/* Meeting details */}
            <h3 className="text-base font-medium text-indigo-700 mt-2 mb-1">{request.title}</h3>
            <p className="text-sm text-gray-600 mb-3">{request.description}</p>

            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-4">
              <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-100">
                <CalendarIcon size={14} className="text-gray-400" />
                <span>{format(new Date(request.date), 'MMM d, yyyy')}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-100">
                <Clock size={14} className="text-gray-400" />
                <span>{request.startTime} - {request.endTime}</span>
              </div>
            </div>

            {/* Action buttons — always at the bottom, inside the card */}
            <div className="flex gap-3 pt-3 border-t border-gray-100">
              <Button 
                onClick={() => onAccept(request.id)}
                className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white"
                size="sm"
              >
                <Check size={16} /> Accept
              </Button>
              <Button 
                onClick={() => onDecline(request.id)}
                variant="outline"
                className="flex-1 flex items-center justify-center gap-2 text-gray-700 border-gray-300 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                size="sm"
              >
                <X size={16} /> Decline
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
