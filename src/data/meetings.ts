import { Meeting, AvailabilitySlot, MeetingStatus } from '../types';

export const availabilitySlots: AvailabilitySlot[] = [
  { id: 'slot_1', userId: 'e1', dayOfWeek: 1, startTime: '09:00', endTime: '12:00' },
  { id: 'slot_2', userId: 'e1', dayOfWeek: 2, startTime: '13:00', endTime: '16:00' },
  { id: 'slot_3', userId: 'e1', dayOfWeek: 3, startTime: '10:00', endTime: '14:00' },
  { id: 'slot_4', userId: 'i1', dayOfWeek: 1, startTime: '10:00', endTime: '15:00' },
  { id: 'slot_5', userId: 'i1', dayOfWeek: 4, startTime: '09:00', endTime: '11:00' }
];

export const meetings: Meeting[] = [
  {
    id: 'meet_1',
    requesterId: 'i1',
    receiverId: 'e1',
    title: 'Strategy Sync with Product Design Team',
    description: 'Would love to sync on the budget for the upcoming campaign next week.',
    date: '2026-03-15',
    startTime: '10:00',
    endTime: '11:00',
    status: 'confirmed',
    createdAt: '2026-03-08T09:00:00Z'
  },
  {
    id: 'meet_2',
    requesterId: 'e2',
    receiverId: 'e1',
    title: 'Marketing Plan Review',
    description: 'Let\'s go over the ad spend allocation.',
    date: '2026-03-20',
    startTime: '14:00',
    endTime: '15:00',
    status: 'pending',
    createdAt: '2026-03-08T11:30:00Z'
  },
  {
    id: 'meet_3',
    requesterId: 'i2',
    receiverId: 'e1',
    title: 'Investment Due Diligence',
    description: 'Follow-up questions regarding the Q3 report.',
    date: '2026-03-22',
    startTime: '09:00',
    endTime: '10:00',
    status: 'pending',
    createdAt: '2026-03-08T14:15:00Z'
  },
  {
    id: 'meet_4',
    requesterId: 'e1',
    receiverId: 'i1',
    title: 'Product Demo & Funding Discussion',
    description: 'Presenting the latest product demo and discussing next funding round.',
    date: '2026-04-02',
    startTime: '11:00',
    endTime: '12:00',
    status: 'pending',
    createdAt: '2026-03-08T10:00:00Z'
  },
  {
    id: 'meet_5',
    requesterId: 'i4',
    receiverId: 'e1',
    title: 'Computer Vision',
    description: 'Discussion on integrating computer vision models into the product pipeline.',
    date: '2026-03-14',
    startTime: '10:00',
    endTime: '11:00',
    status: 'pending',
    createdAt: '2026-03-08T15:00:00Z'
  }
];

export const getMeetingsForUser = (userId: string): Meeting[] => {
  return meetings.filter(
    (meeting) => meeting.requesterId === userId || meeting.receiverId === userId
  ).sort((a, b) => new Date(`${a.date}T${a.startTime}`).getTime() - new Date(`${b.date}T${b.startTime}`).getTime());
};

export const getAvailabilityForUser = (userId: string): AvailabilitySlot[] => {
  return availabilitySlots.filter((slot) => slot.userId === userId);
};

export const updateMeetingStatus = (meetingId: string, status: MeetingStatus): Meeting | undefined => {
  const meetingIndex = meetings.findIndex((m) => m.id === meetingId);
  if (meetingIndex !== -1) {
    meetings[meetingIndex] = { ...meetings[meetingIndex], status };
    return meetings[meetingIndex];
  }
  return undefined;
};

export const addAvailabilitySlot = (slot: Omit<AvailabilitySlot, 'id'>): AvailabilitySlot => {
  const newSlot: AvailabilitySlot = {
    ...slot,
    id: `slot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  };
  availabilitySlots.push(newSlot);
  return newSlot;
};

export const removeAvailabilitySlot = (id: string): void => {
  const index = availabilitySlots.findIndex((s) => s.id === id);
  if (index !== -1) {
    availabilitySlots.splice(index, 1);
  }
};

export const createMeetingRequest = (meeting: Omit<Meeting, 'id' | 'createdAt' | 'status'>): Meeting => {
  const newMeeting: Meeting = {
    ...meeting,
    id: `meet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  meetings.push(newMeeting);
  return newMeeting;
};
