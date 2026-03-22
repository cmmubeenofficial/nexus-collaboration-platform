import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Bell, Calendar, TrendingUp, AlertCircle, PlusCircle, Clock, CreditCard } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { CollaborationRequestCard } from '../../components/collaboration/CollaborationRequestCard';
import { InvestorCard } from '../../components/investor/InvestorCard';
import { useAuth } from '../../context/AuthContext';
import { CollaborationRequest, Meeting } from '../../types';
import { getRequestsForEntrepreneur } from '../../data/collaborationRequests';
import { getMeetingsForUser } from '../../data/meetings';
import { investors } from '../../data/users';
import { format, parseISO } from 'date-fns';

export const EntrepreneurDashboard: React.FC = () => {
  const { user } = useAuth();
  const [collaborationRequests, setCollaborationRequests] = useState<CollaborationRequest[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [recommendedInvestors, setRecommendedInvestors] = useState(investors.slice(0, 3));
  
  useEffect(() => {
    if (user) {
      // Load data
      const requests = getRequestsForEntrepreneur(user.id);
      setCollaborationRequests(requests);
      setMeetings(getMeetingsForUser(user.id));
    }
  }, [user]);
  
  const handleRequestStatusUpdate = (requestId: string, status: 'accepted' | 'rejected') => {
    setCollaborationRequests(prevRequests => 
      prevRequests.map(req => 
        req.id === requestId ? { ...req, status } : req
      )
    );
  };
  
  if (!user) return null;
  
  const pendingRequests = collaborationRequests.filter(req => req.status === 'pending');
  const confirmedMeetings = meetings.filter(m => m.status === 'confirmed');
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome, {user.name}</h1>
          <p className="text-gray-600">Here's what's happening with your startup today</p>
        </div>
        
        <Link to="/investors">
          <Button
            leftIcon={<PlusCircle size={18} />}
          >
            Find Investors
          </Button>
        </Link>
      </div>
      
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-primary-50 border border-primary-100">
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-primary-100 rounded-full mr-4">
                <Bell size={20} className="text-primary-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-primary-700">Pending Requests</p>
                <h3 className="text-xl font-semibold text-primary-900">{pendingRequests.length}</h3>
              </div>
            </div>
          </CardBody>
        </Card>
        
        <Card className="bg-secondary-50 border border-secondary-100">
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-secondary-100 rounded-full mr-4">
                <Users size={20} className="text-secondary-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-secondary-700">Total Connections</p>
                <h3 className="text-xl font-semibold text-secondary-900">
                  {collaborationRequests.filter(req => req.status === 'accepted').length}
                </h3>
              </div>
            </div>
          </CardBody>
        </Card>
        
        <Card className="bg-accent-50 border border-accent-100">
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-accent-100 rounded-full mr-4">
                <Calendar size={20} className="text-accent-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-accent-700">Upcoming Meetings</p>
                <h3 className="text-xl font-semibold text-accent-900">{confirmedMeetings.length}</h3>
              </div>
            </div>
          </CardBody>
        </Card>
        
        <Card className="bg-success-50 border border-success-100">
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full mr-4">
                <TrendingUp size={20} className="text-success-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-success-700">Profile Views</p>
                <h3 className="text-xl font-semibold text-success-900">24</h3>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Collaboration requests */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Collaboration Requests</h2>
              <Badge variant="primary">{pendingRequests.length} pending</Badge>
            </CardHeader>
            
            <CardBody>
              {collaborationRequests.length > 0 ? (
                <div className="space-y-4">
                  {collaborationRequests.map(request => (
                    <CollaborationRequestCard
                      key={request.id}
                      request={request}
                      onStatusUpdate={handleRequestStatusUpdate}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                    <AlertCircle size={24} className="text-gray-500" />
                  </div>
                  <p className="text-gray-600">No collaboration requests yet</p>
                  <p className="text-sm text-gray-500 mt-1">When investors are interested in your startup, their requests will appear here</p>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
        
        {/* Sidebar Widgets */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex justify-between items-center pb-2">
              <h2 className="text-lg font-medium text-gray-900">Confirmed Meetings</h2>
              <Link to="/meetings" className="text-sm font-medium text-primary-600 hover:text-primary-500">
                View Schedule
              </Link>
            </CardHeader>
            <CardBody className="pt-0">
              {confirmedMeetings.length > 0 ? (
                <div className="space-y-3 mt-4">
                  {confirmedMeetings.slice(0, 3).map(meeting => (
                    <div key={meeting.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="bg-indigo-100 text-indigo-700 p-2 rounded flex flex-col items-center justify-center min-w-[48px]">
                        <span className="text-xs font-bold uppercase">{format(parseISO(meeting.date), 'MMM')}</span>
                        <span className="text-sm font-bold">{format(parseISO(meeting.date), 'dd')}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{meeting.title}</p>
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <Clock size={12} className="mr-1" />
                          <span>{meeting.startTime}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-sm text-gray-500">
                  No upcoming meetings
                </div>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Recommended Investors</h2>
              <Link to="/investors" className="text-sm font-medium text-primary-600 hover:text-primary-500">
                View all
              </Link>
            </CardHeader>
            
            <CardBody className="space-y-4">
              {recommendedInvestors.map(investor => (
                <InvestorCard
                  key={investor.id}
                  investor={investor}
                  showActions={false}
                />
              ))}
            </CardBody>
          </Card>

          {/* Wallet Balance Widget */}
          <Link
            to="/payments"
            style={{ textDecoration: 'none', display: 'block', background: 'linear-gradient(135deg,#1e1b4b 0%,#4338ca 100%)', borderRadius: '1rem', padding: '1.125rem 1.25rem', color: '#fff', boxShadow: '0 4px 20px rgba(67,56,202,0.3)', transition: 'transform 0.2s,box-shadow 0.2s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform='translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow='0 10px 30px rgba(67,56,202,0.4)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform=''; (e.currentTarget as HTMLElement).style.boxShadow='0 4px 20px rgba(67,56,202,0.3)'; }}
          >
            <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.6)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.4rem' }}>
              <CreditCard size={11} /> Wallet Balance
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#fff', marginBottom: '0.2rem' }}>$42,850.00</div>
            <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.55)' }}>↑ 18.4% vs last 30 days · View Payments →</div>
          </Link>
        </div>
      </div>
    </div>
  );
};