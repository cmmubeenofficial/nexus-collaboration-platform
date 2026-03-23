import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, PieChart, Filter, Search, PlusCircle, Clock, CreditCard, Video, Phone, FileText } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { EntrepreneurCard } from '../../components/entrepreneur/EntrepreneurCard';
import { useAuth } from '../../context/AuthContext';
import { Meeting } from '../../types';
import { entrepreneurs } from '../../data/users';
import { getRequestsFromInvestor } from '../../data/collaborationRequests';
import { getMeetingsForUser } from '../../data/meetings';
import { format, parseISO } from 'date-fns';

export const InvestorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);

  useEffect(() => {
    if (user) {
      setMeetings(getMeetingsForUser(user.id));
    }
  }, [user]);

  if (!user) return null;

  const confirmedMeetings = meetings.filter(m => m.status === 'confirmed');

  // Get collaboration requests sent by this investor
  const sentRequests = getRequestsFromInvestor(user.id);

  // Filter entrepreneurs based on search and industry filters
  const filteredEntrepreneurs = entrepreneurs.filter(entrepreneur => {
    // Search filter
    const matchesSearch = searchQuery === '' ||
      entrepreneur.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entrepreneur.startupName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entrepreneur.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entrepreneur.pitchSummary.toLowerCase().includes(searchQuery.toLowerCase());

    // Industry filter
    const matchesIndustry = selectedIndustries.length === 0 ||
      selectedIndustries.includes(entrepreneur.industry);

    return matchesSearch && matchesIndustry;
  });

  // Get unique industries for filter
  const industries = Array.from(new Set(entrepreneurs.map(e => e.industry)));

  // Toggle industry selection
  const toggleIndustry = (industry: string) => {
    setSelectedIndustries(prevSelected =>
      prevSelected.includes(industry)
        ? prevSelected.filter(i => i !== industry)
        : [...prevSelected, industry]
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Discover Startups</h1>
          <p className="text-gray-600">Find and connect with promising entrepreneurs</p>
        </div>

        <Link to="/entrepreneurs">
          <Button
            leftIcon={<PlusCircle size={18} />}
          >
            View All Startups
          </Button>
        </Link>
      </div>

      {/* Filters and search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-2/3">
          <Input
            placeholder="Search startups, industries, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            fullWidth
            startAdornment={<Search size={18} />}
          />
        </div>

        <div className="w-full md:w-1/3">
          <div className="flex items-center space-x-2">
            <Filter size={18} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filter by:</span>

            <div className="flex flex-wrap gap-2">
              {industries.map(industry => (
                <Badge
                  key={industry}
                  variant={selectedIndustries.includes(industry) ? 'primary' : 'gray'}
                  className="cursor-pointer"
                  onClick={() => toggleIndustry(industry)}
                >
                  {industry}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-primary-50 border border-primary-100">
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-primary-100 rounded-full mr-4">
                <Users size={20} className="text-primary-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-primary-700">Total Startups</p>
                <h3 className="text-xl font-semibold text-primary-900">{entrepreneurs.length}</h3>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-secondary-50 border border-secondary-100">
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-secondary-100 rounded-full mr-4">
                <PieChart size={20} className="text-secondary-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-secondary-700">Industries</p>
                <h3 className="text-xl font-semibold text-secondary-900">{industries.length}</h3>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-accent-50 border border-accent-100">
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-accent-100 rounded-full mr-4">
                <Users size={20} className="text-accent-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-accent-700">Your Connections</p>
                <h3 className="text-xl font-semibold text-accent-900">
                  {sentRequests.filter(req => req.status === 'accepted').length}
                </h3>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Entrepreneurs grid */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Featured Startups</h2>
            </CardHeader>

            <CardBody>
              {filteredEntrepreneurs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredEntrepreneurs.map(entrepreneur => (
                    <EntrepreneurCard
                      key={entrepreneur.id}
                      entrepreneur={entrepreneur}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">No startups match your filters</p>
                  <Button
                    variant="outline"
                    className="mt-2"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedIndustries([]);
                    }}
                  >
                    Clear filters
                  </Button>
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

          {/* Wallet Balance Widget */}
          <Link
            to="/payments"
            style={{ textDecoration: 'none', display: 'block', background: 'linear-gradient(135deg,#1e1b4b 0%,#4338ca 100%)', borderRadius: '1rem', padding: '1.125rem 1.25rem', color: '#fff', boxShadow: '0 4px 20px rgba(67,56,202,0.3)', transition: 'transform 0.2s,box-shadow 0.2s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 10px 30px rgba(67,56,202,0.4)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(67,56,202,0.3)'; }}
          >
            <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.6)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.4rem' }}>
              <CreditCard size={11} /> Wallet Balance
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#fff', marginBottom: '0.2rem' }}>$1,248,500.00</div>
            <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.55)' }}>3 active deals · View Payments →</div>
          </Link>

          {/* Video Call Widget */}
          <Link
            to="/video-call"
            style={{ textDecoration: 'none', display: 'block', background: 'linear-gradient(135deg,#7c3aed 0%,#a855f7 100%)', borderRadius: '1rem', padding: '1.125rem 1.25rem', color: '#fff', boxShadow: '0 4px 20px rgba(124,58,237,0.3)', transition: 'transform 0.2s,box-shadow 0.2s', marginTop: '1rem' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 10px 30px rgba(124,58,237,0.4)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(124,58,237,0.3)'; }}
          >
            <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.6)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.4rem' }}>
              <Video size={11} /> Video Call
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', marginBottom: '0.2rem' }}>Start Video Meeting</div>
            <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.55)' }}>HD video calls · Join now →</div>
          </Link>

          {/* Audio Call Widget */}
          <Link
            to="/audio-call"
            style={{ textDecoration: 'none', display: 'block', background: 'linear-gradient(135deg,#059669 0%,#10b981 100%)', borderRadius: '1rem', padding: '1.125rem 1.25rem', color: '#fff', boxShadow: '0 4px 20px rgba(5,150,105,0.3)', transition: 'transform 0.2s,box-shadow 0.2s', marginTop: '1rem' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 10px 30px rgba(5,150,105,0.4)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(5,150,105,0.3)'; }}
          >
            <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.6)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.4rem' }}>
              <Phone size={11} /> Audio Call
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', marginBottom: '0.2rem' }}>Voice Conference</div>
            <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.55)' }}>Crystal clear audio · Connect →</div>
          </Link>

          {/* Document Chamber Widget */}
          <Link
            to="/documents"
            style={{ textDecoration: 'none', display: 'block', background: 'linear-gradient(135deg,#0369a1 0%,#0ea5e9 100%)', borderRadius: '1rem', padding: '1.125rem 1.25rem', color: '#fff', boxShadow: '0 4px 20px rgba(3,105,161,0.3)', transition: 'transform 0.2s,box-shadow 0.2s', marginTop: '1rem' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 10px 30px rgba(3,105,161,0.4)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(3,105,161,0.3)'; }}
          >
            <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.6)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.4rem' }}>
              <FileText size={11} /> Document Chamber
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', marginBottom: '0.2rem' }}>Secure Documents</div>
            <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.55)' }}>24 files stored · Access now →</div>
          </Link>
        </div>
      </div>
    </div>
  );
};