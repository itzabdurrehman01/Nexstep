import React, { useState } from 'react';
import { 
  Users, 
  Star, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  MessageSquare, 
  Building2, 
  Award,
  Video
} from 'lucide-react';
import { MENTORS_DATA } from '../../data/mockFullAppData.js';

export function MentorshipTab({ profile }) {
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [bookedSessions, setBookedSessions] = useState([
    {
      id: 'b1',
      mentorName: 'Dr. Shahzad Hassan',
      timeSlot: 'Mon 4:00 PM',
      topic: 'CS Admission & Merit Strategy',
      status: 'Confirmed'
    }
  ]);

  const [bookingSlot, setBookingSlot] = useState('');

  const handleBookSession = (mentor) => {
    if (!bookingSlot) return;
    const newBooking = {
      id: `b-${Date.now()}`,
      mentorName: mentor.name,
      timeSlot: bookingSlot,
      topic: '1-on-1 Academic Counseling',
      status: 'Confirmed'
    };
    setBookedSessions([...bookedSessions, newBooking]);
    setSelectedMentor(null);
    setBookingSlot('');
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Verified Academic & Industry Mentors</h1>
            <p className="text-xs text-slate-400">Book 1-on-1 video guidance sessions with NUST, KEMU, FAST alumni & professors</p>
          </div>
        </div>
      </div>

      {/* Booked Upcoming Sessions Widget */}
      {bookedSessions.length > 0 && (
        <div className="bg-emerald-50/60 rounded-3xl border border-emerald-200 p-6 space-y-3">
          <h2 className="text-sm font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-600" /> Your Scheduled Mentorship Sessions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {bookedSessions.map((b) => (
              <div key={b.id} className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-xs flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">{b.mentorName}</h4>
                  <span className="text-[11px] text-slate-500 font-medium block">{b.topic} • {b.timeSlot}</span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  {b.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mentor Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {MENTORS_DATA.map((m) => (
          <div key={m.id} className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <img src={m.image} alt={m.name} className="w-14 h-14 rounded-2xl object-cover border border-slate-200" />
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{m.name}</h3>
                  <span className="text-[11px] text-emerald-700 font-semibold block">{m.title}</span>
                  <span className="text-[10px] text-slate-500">{m.institution}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs font-semibold text-slate-600">
                <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> {m.rating} ({m.reviewsCount})</span>
                <span>•</span>
                <span className="text-emerald-700 font-bold">{m.hourlyFee}</span>
              </div>

              {/* Specializations */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Expertise:</span>
                <div className="flex flex-wrap gap-1">
                  {m.expertise.map((exp, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold">
                      {exp}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedMentor(m)}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all mt-4"
            >
              <Video className="w-4 h-4" />
              <span>Book Session</span>
            </button>
          </div>
        ))}
      </div>

      {/* Booking Dialog Modal */}
      {selectedMentor && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="font-bold text-slate-900 text-lg">Book Session with {selectedMentor.name}</h3>
            <p className="text-xs text-slate-500">{selectedMentor.title} • {selectedMentor.institution}</p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Select Available Time Slot:</label>
              <div className="space-y-2">
                {selectedMentor.availableSlots.map((slot, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setBookingSlot(slot)}
                    className={`w-full p-2.5 rounded-xl border text-xs font-bold text-left transition-all ${
                      bookingSlot === slot ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setSelectedMentor(null)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs">Cancel</button>
              <button onClick={() => handleBookSession(selectedMentor)} disabled={!bookingSlot} className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs disabled:opacity-50">Confirm Slot</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
