import React, { useState } from 'react';
import { AvailabilitySlot } from '../../types';
import { Button } from '../ui/Button';
import { Plus, Trash2, Clock } from 'lucide-react';
import { addAvailabilitySlot, removeAvailabilitySlot } from '../../data/meetings';

interface AvailabilityManagerProps {
  userId: string;
  initialSlots: AvailabilitySlot[];
}

const daysOfWeek = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

export const AvailabilityManager: React.FC<AvailabilityManagerProps> = ({ userId, initialSlots }) => {
  const [slots, setSlots] = useState<AvailabilitySlot[]>(initialSlots);
  const [newDay, setNewDay] = useState<number>(1); // Default to Monday
  const [newStart, setNewStart] = useState<string>('09:00');
  const [newEnd, setNewEnd] = useState<string>('17:00');

  const handleAddSlot = () => {
    const slot = addAvailabilitySlot({
      userId,
      dayOfWeek: newDay,
      startTime: newStart,
      endTime: newEnd,
    });
    setSlots([...slots, slot]);
  };

  const handleRemoveSlot = (id: string) => {
    removeAvailabilitySlot(id);
    setSlots(slots.filter(s => s.id !== id));
  };

  // Group slots by day
  const groupedSlots = daysOfWeek.map((dayName, index) => {
    return {
      dayIndex: index,
      dayName,
      slotsForDay: slots.filter(s => s.dayOfWeek === index).sort((a, b) => a.startTime.localeCompare(b.startTime))
    };
  }).filter(group => group.slotsForDay.length > 0);

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 overflow-hidden">
      <div className="flex items-center mb-6">
        <div className="bg-blue-100 p-2 rounded-lg mr-3">
          <Clock className="text-blue-600" size={20} />
        </div>
        <h2 className="text-lg font-semibold text-gray-900">Manage Availability</h2>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Add New Time Slot</h3>

        {/* Row 1: Day selector */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-500 mb-1">Day</label>
          <select
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2 px-3 border bg-white"
            value={newDay}
            onChange={(e) => setNewDay(Number(e.target.value))}
          >
            {daysOfWeek.map((day, idx) => (
              <option key={idx} value={idx}>{day}</option>
            ))}
          </select>
        </div>

        {/* Row 2: Start & End time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Start Time</label>
            <input
              type="time"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2 px-2 border bg-white cursor-pointer"
              value={newStart}
              onChange={(e) => setNewStart(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">End Time</label>
            <input
              type="time"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2 px-[7px] border bg-white cursor-pointer"
              value={newEnd}
              onChange={(e) => setNewEnd(e.target.value)}
            />
          </div>
        </div>

        {/* Row 3: Add button */}
        <Button onClick={handleAddSlot} className="w-full flex items-center justify-center gap-2">
          <Plus size={16} /> Add Slot
        </Button>
      </div>

      <div className="space-y-4">
        {groupedSlots.length === 0 && (
          <p className="text-gray-500 text-sm text-center py-4">No availability slots added yet.</p>
        )}
        {groupedSlots.map(group => (
          <div key={group.dayIndex} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
            <h4 className="font-medium text-gray-800 text-sm mb-2">{group.dayName}</h4>
            <div className="flex flex-wrap gap-2">
              {group.slotsForDay.map(slot => (
                <div key={slot.id} className="inline-flex items-center bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full px-3 py-1 text-xs font-medium">
                  {slot.startTime} - {slot.endTime}
                  <button
                    onClick={() => handleRemoveSlot(slot.id)}
                    className="ml-2 text-indigo-400 hover:text-red-500 focus:outline-none transition-colors"
                    aria-label="Remove slot"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
