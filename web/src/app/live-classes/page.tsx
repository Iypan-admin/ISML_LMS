"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { 
  Video, 
  Clock, 
  User, 
  Users, 
  MessageSquare, 
  Hand, 
  Mic,
  MicOff, 
  VideoOff, 
  ShieldCheck, 
  X, 
  Send,
  CheckCircle2,
  Film,
  PhoneOff,
  Smile,
  Monitor,
  BarChart2,
  Lock,
  Volume2
} from 'lucide-react';
import { mockLiveClasses, LiveClass } from '@/mock/liveClasses';
import { currentStudent } from '@/mock/students';

const mockParticipants = [
  { name: "Prof. Hélène Dubois", role: "Host (Main Tutor)", college: "ISML Faculty", isSpeaking: true, micOn: true },
  { name: "Assistant Tutor Ananya", role: "Co-Host (Doubt Specialist)", college: "ISML Team", isSpeaking: false, micOn: false },
  { name: "Bharathi M (You)", role: "Student", college: "Anna University", isSpeaking: false, micOn: false },
  { name: "Priya Sharma", role: "Student", college: "IIT Madras", isSpeaking: false, micOn: false },
  { name: "Rahul Verma", role: "Student", college: "Delhi University", isSpeaking: false, micOn: false },
  { name: "Sneha Patel", role: "Student", college: "IIT Bombay", isSpeaking: false, micOn: false },
  { name: "Karthik Raja", role: "Student", college: "PSG Tech", isSpeaking: false, micOn: false },
];

export default function LiveClassesPage() {
  const [activeTab, setActiveTab] = useState<'LIVE_NOW' | 'TODAY' | 'UPCOMING' | 'COMPLETED'>('LIVE_NOW');
  const [activeRoom, setActiveRoom] = useState<LiveClass | null>(null);
  
  // Studio Drawer State
  const [rightDrawerTab, setRightDrawerTab] = useState<'CHAT' | 'PEOPLE' | 'POLLS'>('CHAT');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([
    { sender: 'Prof. Hélène Dubois', role: 'Main Tutor', text: 'Bonjour à tous! Welcome to today\'s webinar class on Bistro Conversations.', time: '10:30 AM' },
    { sender: 'Assistant Tutor Ananya', role: 'Doubt Tutor', text: 'Please type your questions in the chat box. I am monitoring live doubts.', time: '10:32 AM' },
    { sender: 'Priya Sharma', role: 'Student (IIT Madras)', text: 'Bonjour professeur!', time: '10:33 AM' }
  ]);
  const [handRaised, setHandRaised] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
  const [pollVoted, setPollVoted] = useState<number | null>(null);

  const filteredClasses = mockLiveClasses.filter(c => c.status === activeTab);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setMessages(prev => [...prev, { sender: currentStudent.name, role: 'Student', text: chatInput, time: '10:44 AM' }]);
    setChatInput('');
  };

  const handleSendReaction = (emoji: string) => {
    setSelectedEmoji(emoji);
    setTimeout(() => setSelectedEmoji(null), 2000);
  };

  const openMobileDrawer = (tab: 'CHAT' | 'PEOPLE' | 'POLLS') => {
    setRightDrawerTab(tab);
    setMobileDrawerOpen(true);
  };

  return (
    <div className="space-y-6 pb-8 font-sans">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-sky-50 text-slate-900 p-4 sm:p-6 rounded-2xl shadow-xs space-y-2 border border-blue-200">
        <div className="flex items-center gap-2 text-xs font-mono text-[#0052CC]">
          <ShieldCheck className="w-4 h-4 text-[#0052CC]" />
          <span>Enrolled Batch Schedule • {currentStudent.batchName}</span>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-[#0B2447]">Live Webinar Classes</h1>
        <p className="text-xs text-slate-600">
          Join interactive live webinar classes with expert native instructors.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1">
        {[
          { key: 'LIVE_NOW', label: '🔴 Live Now', count: mockLiveClasses.filter(c => c.status === 'LIVE_NOW').length },
          { key: 'TODAY', label: "Today's Schedule", count: mockLiveClasses.filter(c => c.status === 'TODAY').length },
          { key: 'UPCOMING', label: 'Upcoming Classes', count: mockLiveClasses.filter(c => c.status === 'UPCOMING').length },
          { key: 'COMPLETED', label: 'Completed Classes', count: mockLiveClasses.filter(c => c.status === 'COMPLETED').length }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === tab.key
                ? 'bg-[#0052CC] text-white border-b-2 border-cyan-400 shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
              activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Class Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredClasses.length === 0 ? (
          <div className="col-span-2 p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
            <p className="text-sm font-bold text-slate-700">No scheduled classes found under this tab.</p>
            <p className="text-xs text-slate-500">Check back later for upcoming timetable updates.</p>
          </div>
        ) : (
          filteredClasses.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold ${
                    item.status === 'LIVE_NOW' ? 'bg-rose-600 text-white animate-live-pulse' : 'bg-blue-100 text-[#0052CC]'
                  }`}>
                    {item.status === 'LIVE_NOW' ? '🔴 LIVE WEBINAR NOW' : item.timeSlot}
                  </span>
                  <span className="text-xs font-mono font-semibold text-slate-500">{item.moduleName}</span>
                </div>

                <h3 className="text-base font-bold text-[#0B2447] leading-snug">{item.topic}</h3>

                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 border border-blue-400">
                    <Image src={item.tutorAvatar} alt={item.tutorName} fill className="object-cover" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">{item.tutorName}</p>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{item.tutorTitle}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50/80 border-t border-slate-200 flex items-center justify-between">
                <div className="text-xs text-slate-500 font-medium flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#0052CC]" />
                  <span>{item.date} • {item.durationMins} Mins</span>
                </div>

                {item.status === 'LIVE_NOW' && (
                  <button
                    onClick={() => { setActiveRoom(item); setMobileDrawerOpen(false); }}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold rounded-xl shadow-md flex items-center gap-1.5 transition-transform transform active:scale-95 cursor-pointer"
                  >
                    <Video className="w-4 h-4" />
                    <span>Join Live Class</span>
                  </button>
                )}

                {item.status === 'COMPLETED' && item.recordingAvailable && (
                  <a
                    href="/recordings"
                    className="px-3.5 py-1.5 bg-[#0052CC] hover:bg-blue-700 text-white text-xs font-bold rounded-lg flex items-center gap-1"
                  >
                    <Film className="w-3.5 h-3.5" /> Watch Replay
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* 🎬 100% MOBILE-OPTIMIZED GOOGLE MEET / ZOOM CLASSROOM MODAL */}
      {activeRoom && (
        <div className="fixed inset-0 bg-[#121212] z-50 flex flex-col font-sans text-white overflow-hidden">
          {/* Top Header Bar */}
          <div className="h-14 bg-[#1E1E1E] border-b border-white/10 px-3 sm:px-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 truncate">
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-600/30 text-rose-400 border border-rose-500/40 text-[10px] sm:text-xs font-extrabold animate-pulse shrink-0">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>REC</span>
              </div>
              <h2 className="text-xs sm:text-sm font-bold text-white truncate max-w-[180px] sm:max-w-xl">
                {activeRoom.topic}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <span className="hidden md:flex items-center gap-1.5 text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Stay Time: 18:42 Mins (Attendance Tracked)</span>
              </span>

              <button
                onClick={() => setActiveRoom(null)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white"
                title="Exit Class"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex overflow-hidden relative">
            {/* Left Studio Stage View (Occupies 100% on Mobile!) */}
            <div className="flex-1 bg-[#121212] p-2 sm:p-4 flex flex-col justify-between relative overflow-hidden w-full">
              {/* Main Stage Grid */}
              <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-2 sm:gap-3 relative rounded-2xl overflow-hidden bg-[#1E1E1E] border border-white/10 p-2">
                {/* Main Stage: Presentation Screen Share */}
                <div className="lg:col-span-3 bg-slate-900 rounded-xl relative overflow-hidden flex flex-col justify-between border border-slate-800 h-full">
                  <div className="p-2.5 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between z-10 text-xs">
                    <span className="font-bold text-cyan-400 flex items-center gap-1.5 truncate">
                      <Monitor className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span className="truncate">Prof. Hélène Dubois (Screen Share)</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded shrink-0">1080p</span>
                  </div>

                  {/* Presentation Slide Content Simulation */}
                  <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 text-center space-y-3 bg-gradient-to-b from-slate-900 via-[#0B2447] to-slate-950 overflow-y-auto">
                    <div className="p-4 bg-white/10 border border-white/20 rounded-2xl backdrop-blur-md w-full max-w-lg space-y-2 shadow-2xl">
                      <span className="text-[10px] font-mono font-bold text-cyan-300 uppercase tracking-widest">Syllabus Slide 14</span>
                      <h3 className="text-base sm:text-xl font-bold text-white font-serif leading-snug">Au Café — Essential French Ordering Phrases</h3>
                      <div className="p-3 bg-slate-950/80 rounded-xl text-left space-y-1.5 text-xs text-slate-200 font-mono">
                        <p><span className="text-cyan-400 font-bold">Tutor:</span> "Bonjour! Que désirez-vous?"</p>
                        <p><span className="text-emerald-400 font-bold">Student:</span> "Je voudrais un café au lait, s'il vous plaît."</p>
                      </div>
                    </div>
                  </div>

                  {/* Floating Reaction Bubble */}
                  {selectedEmoji && (
                    <div className="absolute bottom-12 right-6 p-2.5 bg-slate-900/90 text-2xl rounded-full border border-cyan-400/50 shadow-2xl animate-bounce z-20">
                      {selectedEmoji}
                    </div>
                  )}
                </div>

                {/* Right Column: Tutor Spotlight + Student Thumbnails */}
                <div className="lg:col-span-1 flex flex-row lg:flex-col gap-2 shrink-0">
                  {/* Tutor Active Speaker Tile */}
                  <div className="relative aspect-video lg:aspect-auto flex-1 rounded-xl overflow-hidden bg-slate-950 border-2 border-cyan-500/80 shadow-lg min-h-[90px]">
                    <Image src={activeRoom.tutorAvatar} alt={activeRoom.tutorName} fill className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />
                    <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded bg-slate-900/90 border border-cyan-400/50 flex items-center gap-1 text-[9px] font-bold text-cyan-300">
                      <Volume2 className="w-3 h-3 text-cyan-400 animate-pulse" />
                      <span>Speaking</span>
                    </div>
                    <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center justify-between text-[11px] text-white font-bold truncate">
                      <span className="truncate">{activeRoom.tutorName}</span>
                    </div>
                  </div>

                  {/* Student Participant Thumbnail Grid */}
                  <div className="hidden sm:grid grid-cols-2 lg:grid-cols-2 gap-1.5 shrink-0">
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-800 border border-slate-700 flex items-center justify-center">
                      <Image src={currentStudent.avatarUrl} alt="You" fill className="object-cover opacity-90" />
                      <div className="absolute bottom-1 left-1 bg-slate-900/80 px-1 py-0.2 rounded text-[8px] font-bold text-white">You</div>
                    </div>

                    <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-800 border border-slate-700 flex items-center justify-center">
                      <Image src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" alt="Priya" fill className="object-cover opacity-90" />
                      <div className="absolute bottom-1 left-1 bg-slate-900/80 px-1 py-0.2 rounded text-[8px] font-bold text-white">Priya</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 🎛 FLOATING GOOGLE MEET CONTROL DOCK BAR */}
              <div className="mt-2 p-2 bg-[#1E1E1E] rounded-2xl border border-white/10 flex items-center justify-between max-w-3xl mx-auto w-full shadow-2xl z-20">
                <div className="flex items-center gap-1.5">
                  <button className="p-2.5 sm:p-3 rounded-full bg-rose-600/20 border border-rose-500/40 text-rose-400" title="Mic Muted">
                    <MicOff className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>

                  <button className="p-2.5 sm:p-3 rounded-full bg-slate-800 border border-white/10 text-slate-400" title="Camera Off">
                    <VideoOff className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>

                  {/* Hand Raise */}
                  <button
                    onClick={() => setHandRaised(!handRaised)}
                    className={`p-2.5 sm:p-3 rounded-full border transition-all cursor-pointer ${
                      handRaised ? 'bg-amber-500 border-amber-400 text-slate-950 animate-bounce' : 'bg-slate-800 border-white/10 text-white'
                    }`}
                  >
                    <Hand className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>

                  {/* Emoji Quick Reactions */}
                  <div className="hidden md:flex items-center gap-1 bg-slate-800/80 p-1 rounded-full border border-white/10">
                    {['👏', '👍', '❤️', '❓'].map((emoji) => (
                      <button key={emoji} onClick={() => handleSendReaction(emoji)} className="p-1 hover:bg-white/10 rounded-full text-sm">
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Drawer Controls */}
                  <button
                    onClick={() => { setRightDrawerTab('CHAT'); setMobileDrawerOpen(true); }}
                    className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 border transition-all ${
                      rightDrawerTab === 'CHAT' ? 'bg-[#0052CC] border-cyan-400 text-white' : 'bg-slate-800 border-white/10 text-slate-300'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span className="hidden sm:inline">Chat</span>
                  </button>

                  <button
                    onClick={() => { setRightDrawerTab('PEOPLE'); setMobileDrawerOpen(true); }}
                    className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 border transition-all ${
                      rightDrawerTab === 'PEOPLE' ? 'bg-[#0052CC] border-cyan-400 text-white' : 'bg-slate-800 border-white/10 text-slate-300'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span className="hidden sm:inline">People</span>
                  </button>

                  {/* Red Leave Class Button */}
                  <button
                    onClick={() => setActiveRoom(null)}
                    className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold rounded-full flex items-center gap-1 shadow-lg shadow-rose-900/50 cursor-pointer shrink-0"
                  >
                    <PhoneOff className="w-4 h-4" />
                    <span>Leave</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Desktop Side Drawer Panel (hidden on mobile, visible lg:flex) */}
            <div className="hidden lg:flex w-96 bg-[#1E1E1E] border-l border-white/10 flex-col h-full shrink-0">
              <div className="p-3 bg-[#181818] border-b border-white/10 flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-300 flex items-center gap-2">
                  {rightDrawerTab === 'CHAT' && <><MessageSquare className="w-4 h-4" /> In-Class Live Chat</>}
                  {rightDrawerTab === 'PEOPLE' && <><Users className="w-4 h-4" /> Connected Participants (248)</>}
                  {rightDrawerTab === 'POLLS' && <><BarChart2 className="w-4 h-4" /> Live In-Class Polls</>}
                </span>
              </div>

              {/* Chat Feed */}
              {rightDrawerTab === 'CHAT' && (
                <div className="flex-1 flex flex-col h-full overflow-hidden">
                  <div className="flex-1 p-3 overflow-y-auto space-y-3 text-xs">
                    {messages.map((m, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-bold text-cyan-300">{m.sender}</span>
                          <span className="text-slate-400">{m.time}</span>
                        </div>
                        <p className="text-slate-200">{m.text}</p>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleSendMessage} className="p-3 border-t border-white/10 flex items-center gap-2 bg-[#181818]">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Send a message to everyone..."
                      className="flex-1 bg-[#252525] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-400"
                    />
                    <button type="submit" className="p-2 bg-[#0052CC] text-white rounded-xl">
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              )}

              {/* People Feed */}
              {rightDrawerTab === 'PEOPLE' && (
                <div className="flex-1 p-3 overflow-y-auto space-y-2 text-xs">
                  {mockParticipants.map((p, idx) => (
                    <div key={idx} className="p-2.5 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-100">{p.name}</p>
                        <p className="text-[10px] text-cyan-300">{p.role} • {p.college}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile Slide-Up Bottom Sheet Overlay (Only when opened on mobile!) */}
            {mobileDrawerOpen && (
              <div className="lg:hidden absolute inset-0 bg-slate-950/80 backdrop-blur-md z-40 flex flex-col justify-end">
                <div className="bg-[#1E1E1E] border-t border-white/20 rounded-t-2xl h-[70vh] flex flex-col overflow-hidden text-white shadow-2xl">
                  <div className="p-3 bg-[#181818] border-b border-white/10 flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-300 flex items-center gap-2">
                      {rightDrawerTab === 'CHAT' && <><MessageSquare className="w-4 h-4" /> In-Class Live Chat</>}
                      {rightDrawerTab === 'PEOPLE' && <><Users className="w-4 h-4" /> Connected Participants (248)</>}
                    </span>
                    <button onClick={() => setMobileDrawerOpen(false)} className="p-1.5 bg-white/10 rounded-lg text-slate-300">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {rightDrawerTab === 'CHAT' && (
                    <div className="flex-1 flex flex-col h-full overflow-hidden">
                      <div className="flex-1 p-3 overflow-y-auto space-y-3 text-xs">
                        {messages.map((m, idx) => (
                          <div key={idx} className="p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="font-bold text-cyan-300">{m.sender}</span>
                              <span className="text-slate-400">{m.time}</span>
                            </div>
                            <p className="text-slate-200">{m.text}</p>
                          </div>
                        ))}
                      </div>

                      <form onSubmit={handleSendMessage} className="p-3 border-t border-white/10 flex items-center gap-2 bg-[#181818]">
                        <input
                          type="text"
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          placeholder="Send a message to everyone..."
                          className="flex-1 bg-[#252525] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-400"
                        />
                        <button type="submit" className="p-2 bg-[#0052CC] text-white rounded-xl">
                          <Send className="w-4 h-4" />
                        </button>
                      </form>
                    </div>
                  )}

                  {rightDrawerTab === 'PEOPLE' && (
                    <div className="flex-1 p-3 overflow-y-auto space-y-2 text-xs">
                      {mockParticipants.map((p, idx) => (
                        <div key={idx} className="p-2.5 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between">
                          <div>
                            <p className="font-bold text-slate-100">{p.name}</p>
                            <p className="text-[10px] text-cyan-300">{p.role} • {p.college}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
