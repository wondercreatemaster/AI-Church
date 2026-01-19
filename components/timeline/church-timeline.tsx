"use client";

import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare } from "lucide-react";

interface TimelineEvent {
  year: number | string;
  title: string;
  description: string;
  branch: "orthodox" | "catholic" | "protestant" | "anglican" | "baptist" | "other";
  importance?: "high" | "medium" | "low";
}

interface VisualTimelineEvent {
  year: number;
  title: string;
  description: string;
  color: string;
  branch: string;
  x: number;
}

interface EraSection {
  id: string;
  title: string;
  period: string;
  description: string;
  events: TimelineEvent[];
  branchColor: string;
}

export function ChurchTimeline() {
  const [expandedSections, setExpandedSections] = useState<string[]>(["era1"]);
  const timelineRef = useRef<HTMLDivElement>(null);

  const handleEventClick = (event: TimelineEvent) => {
    // Save event context to localStorage for the chat
    localStorage.setItem("selectedEvent", JSON.stringify({
      year: event.year,
      title: event.title,
      description: event.description,
      branch: event.branch
    }));
    
    // Navigate to chat with context
    window.location.assign("/chat");
  };

  const handleVisualEventClick = (event: VisualTimelineEvent) => {
    // Save event context to localStorage for the chat
    localStorage.setItem("selectedEvent", JSON.stringify({
      year: event.year,
      title: event.title,
      description: event.description,
      branch: event.branch
    }));
    
    // Navigate to chat with context
    window.location.assign("/chat");
  };

  // Visual timeline events for mobile view
  const visualTimelineEvents: VisualTimelineEvent[] = [
    { year: 0, title: "Birth of Christ", description: "The Incarnation", color: "bg-yellow-500", branch: "origin", x: 0 },
    { year: 33, title: "Early Church", description: "Pentecost & Apostolic Era", color: "bg-blue-600", branch: "early", x: 12.5 },
    { year: 325, title: "Council of Nicaea", description: "First Ecumenical Council", color: "bg-blue-600", branch: "early", x: 25 },
    { year: 451, title: "Council of Chalcedon", description: "Oriental Orthodox split", color: "bg-orange-500", branch: "oriental", x: 37.5 },
    { year: 1054, title: "Great Schism", description: "East-West division", color: "bg-byzantine-600", branch: "orthodox", x: 50 },
    { year: 1517, title: "Protestant Reformation", description: "Luther's 95 Theses", color: "bg-green-600", branch: "protestant", x: 62.5 },
    { year: 1534, title: "Anglican Church", description: "Church of England formed", color: "bg-purple-600", branch: "anglican", x: 75 },
    { year: 1830, title: "Restoration Movement", description: "American Christian movements", color: "bg-red-500", branch: "restoration", x: 87.5 },
    { year: 2025, title: "Today", description: "Modern Christianity", color: "bg-gray-700", branch: "modern", x: 100 },
  ];

  // Comprehensive timeline data organized by era
  const timelineData: EraSection[] = [
    {
      id: "era1",
      title: "New Testament Era",
      period: "0–100 AD",
      description: "The birth of Christianity and the Apostolic Age",
      branchColor: "bg-yellow-500",
      events: [
        { year: 33, title: "Pentecost", description: "A.D. 29 is thought to be more accurate", branch: "orthodox", importance: "high" },
        { year: 49, title: "Council at Jerusalem", description: "Acts 15 establishes precedent for addressing church disputes in Council. James presides as bishop.", branch: "orthodox", importance: "high" },
        { year: 69, title: "Bishop Ignatius Consecrated", description: "Bishop Ignatius consecrated in Antioch in the heart of New Testament era. St. Peter had been the first bishop there. Other early bishops include James, Polycarp, Clement.", branch: "orthodox" },
        { year: 95, title: "Book of Revelation", description: "Book of Revelation written, probably the last of the New Testament books.", branch: "orthodox" },
      ]
    },
    {
      id: "era2",
      title: "Early Church Period",
      period: "100–300 AD",
      description: "The formation of early Christian doctrine and practice",
      branchColor: "bg-blue-500",
      events: [
        { year: 150, title: "St. Justin Martyr Describes Liturgy", description: "St. Justin Martyr describes the liturgical worship of the Church, centered in the Eucharist. Liturgical worship is rooted in both the Old and New Testaments.", branch: "orthodox" },
        { year: 313, title: "Edict of Milan", description: "The Edict of Milan marks an end to the period of Roman persecution of Christianity.", branch: "orthodox", importance: "high" },
      ]
    },
    {
      id: "era3",
      title: "The Seven Ecumenical Councils",
      period: "325–787 AD",
      description: "Defining orthodox doctrine through ecumenical councils",
      branchColor: "bg-blue-600",
      events: [
        { year: 325, title: "First Ecumenical Council, Nicaea", description: "Addressed Arian heresy. Affirmed that the Son of God is of one essence with the Father.", branch: "orthodox", importance: "high" },
        { year: 381, title: "Second Ecumenical Council, Constantinople", description: "Affirmed the divinity of the Holy Spirit. Confirmed the Nicene faith.", branch: "orthodox", importance: "high" },
        { year: 451, title: "Fourth Ecumenical Council, Chalcedon", description: "Affirms apostolic doctrine of two natures in Christ.", branch: "orthodox", importance: "high" },
        { year: 482, title: "Synod in Toledo, Spain", description: "A synod in Toledo, Spain, adds the filioque to the Nicene Creed (asserting that the Holy Spirit proceeds from Father and the Son). This error is later adopted by Rome.", branch: "catholic" },
        { year: 553, title: "Fifth Ecumenical Council, Constantinople", description: "Reaffirms earlier councils and Christology.", branch: "orthodox", importance: "high" },
        { year: 680, title: "Sixth Ecumenical Council, Constantinople", description: "Rejects monothelitism; affirms Christ has two wills.", branch: "orthodox", importance: "high" },
        { year: 787, title: "Seventh Ecumenical Council, Nicaea", description: "Restores veneration of icons after the Iconoclast controversy.", branch: "orthodox", importance: "high" },
      ]
    },
    {
      id: "era4",
      title: "Late 8th–10th Century",
      period: "787–1000 AD",
      description: "Growing tensions between East and West",
      branchColor: "bg-purple-500",
      events: [
        { year: 880, title: "Council Declares Filioque Heretical", description: "A final council in Constantinople declares the filioque heretical (in Eastern Church).", branch: "orthodox" },
        { year: 988, title: "Conversion of Rus'", description: "Conversion of Rus' (Russia) begins.", branch: "orthodox", importance: "high" },
      ]
    },
    {
      id: "era5",
      title: "The Great Schism & After",
      period: "1054–1453 AD",
      description: "The division between East and West becomes permanent",
      branchColor: "bg-red-600",
      events: [
        { year: 1054, title: "The Great Schism", description: "The Great Schism occurs. Two major issues: Rome's claim to universal papal supremacy and addition of the filioque to the Nicene Creed. The Photian Schism (880) had earlier highlighted these issues.", branch: "orthodox", importance: "high" },
        { year: 1066, title: "Norman Conquest of Britain", description: "Norman conquest of Britain. Orthodox hierarchs replaced with those loyal to Rome.", branch: "catholic" },
        { year: "1095–1099", title: "Crusades Begin", description: "Crusades launched by Rome.", branch: "catholic" },
        { year: 1204, title: "Sack of Constantinople", description: "Sack of Constantinople by Roman crusaders. Deepens estrangement of East and West.", branch: "catholic", importance: "high" },
        { year: 1333, title: "St. Gregory Palamas", description: "St. Gregory Palamas defends Orthodox doctrine of hesychasm and the uncreated energies of God.", branch: "orthodox" },
        { year: 1453, title: "Fall of Constantinople", description: "Turks overrun Constantinople; Byzantine Empire ends.", branch: "orthodox", importance: "high" },
      ]
    },
    {
      id: "era6",
      title: "Reformation & Modern Era",
      period: "1517–1870 AD",
      description: "Protestant Reformation and further divisions in Western Christianity",
      branchColor: "bg-green-600",
      events: [
        { year: 1517, title: "Protestant Reformation", description: "Martin Luther nails his 95 Theses, beginning the Protestant Reformation.", branch: "protestant", importance: "high" },
        { year: 1534, title: "Church of England", description: "Church of England begins pulling away from Rome (King Henry VIII).", branch: "anglican", importance: "high" },
        { year: 1536, title: "Calvinism", description: "John Calvin establishes Reformed theology.", branch: "protestant" },
        { year: 1560, title: "Presbyterianism", description: "John Knox establishes Presbyterian tradition.", branch: "protestant" },
        { year: 1609, title: "Baptist Church", description: "John Smyth founds the Baptist tradition.", branch: "baptist" },
        { year: 1648, title: "Congregationalism", description: "Pilgrim Puritan ministers (John Cotton influential).", branch: "protestant" },
        { year: 1650, title: "Quakers", description: "George Fox founds the Quaker movement.", branch: "protestant" },
        { year: 1675, title: "Pietism", description: "Philipp Jakob Spener begins Pietist movement.", branch: "protestant" },
        { year: 1738, title: "Methodism", description: "John Wesley founds Methodist tradition.", branch: "protestant" },
        { year: 1784, title: "Orthodoxy in North America", description: "Missionaries arrive in Kodiak Island (Alaska). Orthodoxy begins in North America.", branch: "orthodox", importance: "high" },
        { year: 1830, title: "Adventist Movement & LDS", description: "William Miller (Adventist) and Joseph Smith (Latter-day Saints/Mormonism) establish new movements.", branch: "other" },
        { year: 1870, title: "Papal Infallibility", description: "Papal Infallibility becomes Roman Catholic dogma.", branch: "catholic", importance: "high" },
      ]
    },
    {
      id: "era7",
      title: "19th Century Movements",
      period: "1800–1900 AD",
      description: "New religious movements and denominations emerge",
      branchColor: "bg-indigo-600",
      events: [
        { year: "Mid-19th C", title: "Baháʼí Faith", description: "Baháʼu'lláh founds the Baháʼí Faith.", branch: "other" },
        { year: "Mid-19th C", title: "Seventh-day Adventists", description: "Ellen G. White and William Miller establish Seventh-day Adventist tradition.", branch: "other" },
        { year: "Late 19th C", title: "Jehovah's Witnesses", description: "Charles Taze Russell founds Jehovah's Witnesses.", branch: "other" },
        { year: "Late 19th C", title: "Christian Science", description: "Mary Baker Eddy establishes Christian Science.", branch: "other" },
        { year: "Late 19th C", title: "Rastafarianism", description: "Leonard Howell (development centered on Haile Selassie).", branch: "other" },
      ]
    },
    {
      id: "era8",
      title: "20th–21st Century",
      period: "1900–2025 AD",
      description: "Modern Christianity and contemporary movements",
      branchColor: "bg-gray-600",
      events: [
        { year: 1906, title: "Pentecostal Movement", description: "Charismatic renewal movement begins.", branch: "protestant", importance: "high" },
        { year: "Mid-20th C", title: "Scientology", description: "L. Ron Hubbard founds Scientology.", branch: "other" },
        { year: "Mid-20th C", title: "Unification Church", description: "Sun Myung Moon establishes Unification Church (Moonies).", branch: "other" },
        { year: "Mid-20th C", title: "Neo-Paganism", description: "Modern revival with multiple founders.", branch: "other" },
        { year: "1970-2000", title: "Non-Denominational Evangelical", description: "Non-Denominational Evangelical Churches. No single founder. Originated from evangelical, charismatic, and megachurch movements.", branch: "protestant" },
        { year: 2025, title: "Today", description: "Modern Christianity continues across all traditions.", branch: "orthodox", importance: "high" },
      ]
    },
  ];

  const branchConfig = {
    orthodox: { color: "bg-byzantine-600 border-byzantine-600", label: "Orthodox", textColor: "text-byzantine-700" },
    catholic: { color: "bg-red-600 border-red-600", label: "Catholic", textColor: "text-red-700" },
    protestant: { color: "bg-green-600 border-green-600", label: "Protestant", textColor: "text-green-700" },
    anglican: { color: "bg-purple-600 border-purple-600", label: "Anglican", textColor: "text-purple-700" },
    baptist: { color: "bg-blue-700 border-blue-700", label: "Baptist", textColor: "text-blue-800" },
    other: { color: "bg-gray-600 border-gray-600", label: "Other", textColor: "text-gray-700" },
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Interactive Timeline - Mobile Only */}
      <div className="md:hidden">
        <Card className="p-6 bg-white/95 backdrop-blur-sm shadow-2xl border-2 border-byzantine-300 rounded-3xl overflow-hidden">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-display font-bold text-orthodox-600 mb-3">
              The Timeline of Christianity
            </h3>
            <p className="text-gray-600 text-sm">
              From the Incarnation to today — witness the unfolding of Christian history
            </p>
          </div>
          
          {/* Timeline Visualization */}
          <div ref={timelineRef} className="relative md:px-8 px-20 overflow-x-auto scrollbar-thin scrollbar-thumb-byzantine-400 scrollbar-track-gray-200 pb-6">
            <div className="md:min-w-[1400px] min-w-[2200px] h-96 relative">
              {/* Base timeline line with gradient sections */}
              <div className="absolute md:min-w-[1400px] min-w-[2340px] -left-8 top-48 left-0 right-0 h-3 rounded-full overflow-hidden shadow-lg">
                <div className="absolute inset-0 bg-linear-to-r from-yellow-400 via-blue-500 to-gray-600" />
                <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent animate-pulse" />
              </div>
              
              {/* Timeline events */}
              {visualTimelineEvents.map((event, index) => {
                const isTop = index % 2 === 0;
                
                return (
                  <div
                    key={index}
                    onClick={() => handleVisualEventClick(event)}
                    className="absolute transition-all min-w-[150px] duration-700 ease-out group hover:scale-105 z-10 cursor-pointer"
                    style={{ 
                      left: `${event.x}%`, 
                      top: isTop ? '-2px' : 'auto',
                      bottom: isTop ? 'auto' : '0px'
                    }}
                  >
                    {/* Connecting line with glow effect */}
                    <div 
                      className={`absolute w-1 ${event.color} ${isTop ? 'top-full' : 'bottom-full'} transition-all duration-300 opacity-70 group-hover:opacity-100`}
                      style={{ 
                        height: isTop ? '120px' : '120px', 
                        left: '34%', 
                        transform: 'translateX(-50%)'
                      }}
                    />
                    
                    {/* Event marker */}
                    <div className={`relative left-[-14%] w-10 h-10 ${event.color} rounded-full border-4 border-white shadow-2xl mx-auto ${isTop ? 'mb-3' : 'mt-3'} transition-all duration-300 group-hover:ring-4 group-hover:ring-offset-2 group-hover:ring-gray-300`}>
                      {/* Inner glow */}
                      <div className="absolute inset-1 rounded-full bg-white/30" />
                    </div>
                    
                    {/* Event info card */}
                    <div className={`text-center min-w-[160px] -ml-[70px] ${isTop ? 'mb-4' : 'mt-4'}`}>
                      <div className="bg-white rounded-xl p-4 shadow-lg border-2 transition-all duration-300 border-gray-200 group-hover:border-byzantine-300 group-hover:shadow-xl">
                        {/* Year badge */}
                        <div className="inline-block px-3 py-1 rounded-full text-sm font-bold mb-2 bg-gray-100 text-gray-800 group-hover:bg-byzantine-100">
                          {event.year === 0 ? "0 AD" : `${event.year} AD`}
                        </div>
                        {/* Title */}
                        <div className="text-sm font-display font-bold mb-1 transition-colors text-gray-900">
                          {event.title}
                        </div>
                        {/* Description */}
                        <div className="text-xs text-gray-600 leading-relaxed mb-2">
                          {event.description}
                        </div>
                        {/* Chat button */}
                        <div className="flex items-center justify-center gap-1 text-xs font-semibold text-byzantine-600 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MessageSquare className="w-3 h-3" />
                          <span>Chat</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Timeline legend */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex flex-wrap justify-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                <span className="text-gray-600">Origin</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-600 rounded-full" />
                <span className="text-gray-600">Early Church</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full" />
                <span className="text-gray-600">Oriental Orthodox</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-byzantine-600 rounded-full" />
                <span className="text-gray-600">Great Schism</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-600 rounded-full" />
                <span className="text-gray-600">Reformation</span>
              </div>
            </div>
          </div>

          <div className="text-center mt-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <MessageSquare className="w-4 h-4 text-byzantine-600" />
              <p className="text-sm font-semibold text-byzantine-700">
                Tap any event to start a conversation
              </p>
            </div>
            <p className="text-xs text-gray-500 flex items-center justify-center gap-2">
              <span>Scroll horizontally to explore</span>
              <span className="inline-block animate-bounce">→</span>
            </p>
          </div>
        </Card>
      </div>

      {/* Detailed Timeline - Desktop Only */}
      <div className="hidden md:block">
        <Card className="p-6 md:p-10 bg-white/95 backdrop-blur-sm shadow-2xl border-2 border-byzantine-300 rounded-3xl">
          <div className="text-center mb-8">
            <h3 className="text-3xl md:text-4xl font-display font-bold text-orthodox-600 mb-3">
              A Comprehensive Timeline of Church History
            </h3>
            <p className="text-gray-600 text-sm md:text-base">
              From the Apostolic Age through 2,000 years of Christian tradition
            </p>
          </div>

          {/* Visual Branch Legend */}
          <div className="mb-8 p-4 bg-gray-50 rounded-xl">
            <h4 className="text-sm font-semibold text-gray-700 mb-3 text-center">Tradition Branches</h4>
            <div className="flex flex-wrap justify-center gap-3 text-xs">
              {Object.entries(branchConfig).map(([key, config]) => (
                <div key={key} className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full ${config.color.split(' ')[0]}`} />
                  <span className="text-gray-700 font-medium">{config.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Horizontal Timeline Container - Split View */}
          <div className="relative overflow-x-auto overflow-y-visible pb-8 pt-16 scrollbar-thin scrollbar-thumb-byzantine-400 scrollbar-track-gray-200">
            <div className="flex flex-row min-w-max gap-6 relative px-4">
              {/* Branching connection lines */}
              <div className="absolute left-0 top-0 w-full h-full pointer-events-none z-0">
                <div 
                  className="absolute"
                  style={{ 
                    left: 'calc(50% - 100px)', 
                    top: '-64px',
                    width: '170px',
                    height: '200px'
                  }}
                >
                  <svg width="100%" height="100%" viewBox="0 0 170 200" style={{ overflow: 'visible' }}>
                    <defs>
                      <linearGradient id="grad-eastern" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#9333ea" /> {/* purple-600 */}
                        <stop offset="100%" stopColor="#f87171" /> {/* red-400 */}
                      </linearGradient>
                      <linearGradient id="grad-western" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#9333ea" /> {/* purple-600 */}
                        <stop offset="100%" stopColor="#2dd4bf" /> {/* teal-400 */}
                      </linearGradient>
                    </defs>
                    {/* Connection to Eastern (Top) */}
                    <path 
                      d="M 0 139 C 85 139, 85 16, 170 16" 
                      fill="none" 
                      stroke="url(#grad-eastern)" 
                      strokeWidth="6" 
                      strokeLinecap="round"
                      className="opacity-90"
                    />
                    {/* Connection to Western (Bottom) */}
                    <path 
                      d="M 0 139 C 85 139, 85 84, 170 84" 
                      fill="none" 
                      stroke="url(#grad-western)" 
                      strokeWidth="6" 
                      strokeLinecap="round"
                      className="opacity-90"
                    />
                  </svg>
                  

                </div>
              </div>

              {/* Label for Unified Church */}
              <div 
                className="absolute top-[75px] z-50 whitespace-nowrap pointer-events-none"
                style={{ left: 'calc(50% - 150px)', transform: 'translate(-50%, -50%)' }}
              >
                <span className="text-lg font-display font-bold text-purple-700 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl shadow-sm border border-purple-100">
                  One Holy Catholic and Apostolic Church
                </span>
              </div>

              {/* Main unified timeline before 1054 - at the middle where circles are */}
              <div className="absolute top-[75px] left-0 h-1.5 bg-linear-to-r from-yellow-400 via-blue-500 to-purple-600 rounded-full shadow-md z-[1]" style={{ width: 'calc(50% - 100px)' }} />
              
              {/* Eastern Orthodox line (top) - WELL ABOVE circles */}
              <div className="absolute -top-16 h-8 bg-gradient-to-r from-red-400 to-red-500 shadow-lg z-[1] flex items-center" style={{ left: 'calc(50% + 70px)', right: '0' }}>
                <div className="px-3 text-[10px] font-bold text-white tracking-[0.15em] whitespace-nowrap">
                  E A S T E R N&nbsp;&nbsp;&nbsp;C H R I S T I A N I T Y
                </div>
              </div>
              
              {/* Western/Roman Catholic line (bottom) - WELL BELOW circles */}
              <div className="absolute top-1 h-8 bg-gradient-to-r from-teal-400 to-teal-500 shadow-lg z-[1] flex items-center" style={{ left: 'calc(50% + 70px)', right: '0' }}>
                <div className="px-3 text-[10px] font-bold text-white tracking-[0.15em] whitespace-nowrap">
                  W E S T E R N&nbsp;&nbsp;&nbsp;C H R I S T I A N I T Y
                </div>
              </div>
              
              {/* Great Schism split point indicator - centered vertically */}
              <div className="absolute left-1/2 -translate-x-1/2 top-[45px] z-30">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold-500 to-gold-600 border-4 border-white shadow-2xl relative">
                    <div className="absolute inset-2 rounded-full bg-white/30" />
                    <div className="absolute inset-0 rounded-full bg-gold-500 opacity-20 blur-md animate-pulse" />
                    <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-xs">
                      1054
                    </div>
                  </div>
                  <div className="mt-1.5 px-3 py-1 bg-gradient-to-r from-gold-600 to-gold-700 text-white text-[10px] font-bold rounded shadow-lg whitespace-nowrap">
                    Great Schism
                  </div>
                </div>
              </div>
              
              {/* Era sections */}
              {timelineData.map((era) => {
                const isExpanded = expandedSections.includes(era.id);
                const isBeforeSchism = era.id === "era1" || era.id === "era2" || era.id === "era3" || era.id === "era4";
                const isSchism = era.id === "era5";
                const isAfterSchism = !isBeforeSchism && !isSchism;
                
                return (
                  <div 
                    key={era.id} 
                    className="flex flex-col relative" 
                    style={{ 
                      minWidth: '240px',
                      bottom: (isSchism || isAfterSchism) ? '-38px' : '0'
                    }}
                  >
                    {/* Era Header */}
                    <div 
                      onClick={() => {
                        setExpandedSections(prev => 
                          prev.includes(era.id) 
                            ? prev.filter(id => id !== era.id)
                            : [...prev, era.id]
                        );
                      }}
                      className="flex flex-col items-center mb-6 cursor-pointer group z-40"
                    >
                      {/* Era marker */}
                      <div className="relative mb-8 z-40">
                        {/* Outer white ring for clear separation from timeline bars */}
                        <div className="absolute inset-0 w-14 h-14 rounded-full bg-white shadow-2xl -z-10 scale-110" />
                        <div className={`w-14 h-14 rounded-full ${era.branchColor} border-4 border-white shadow-xl relative z-40 group-hover:scale-110 transition-all`}>
                          <div className="absolute inset-2 rounded-full bg-white/40" />
                          <div className={`absolute inset-0 rounded-full ${era.branchColor} opacity-20 blur-md`} />
                        </div>
                      </div>
                      
                      {/* Era title and info - fixed width */}
                      <div className="text-center px-4 py-4 bg-white rounded-xl border-2 border-gray-200 shadow-md hover:shadow-lg hover:border-byzantine-300 transition-all w-[220px] h-[200px] flex flex-col justify-between">
                        <div>
                          <h4 className="text-sm font-display font-bold text-gray-900 group-hover:text-byzantine-700 transition-colors mb-2 line-clamp-2">
                            {era.title}
                          </h4>
                          <Badge variant="outline" className="text-xs bg-gray-50 border-gray-300 mb-2">
                            {era.period}
                          </Badge>
                          <p className="text-xs text-gray-600 mb-3 line-clamp-3">{era.description}</p>
                        </div>
                        <Badge className="text-xs bg-byzantine-100 text-byzantine-700 border-0 w-fit mx-auto">
                          {era.events.length} {era.events.length === 1 ? 'event' : 'events'}
                        </Badge>
                      </div>
                    </div>

                    {/* Events container with dual-row positioning after schism */}
                    {isExpanded && (
                      <div className="relative">
                        {/* Split events into Eastern and Western branches after Great Schism */}
                        {isAfterSchism ? (
                          <div className="grid grid-cols-1 gap-8 px-2 pt-16">
                            {/* Eastern Orthodox events (top row) */}
                            {era.events.filter(e => e.branch === "orthodox").length > 0 && (
                              <div className="relative">
                                <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-0.5 h-12 bg-linear-to-b from-byzantine-300 to-byzantine-200 z-0" />
                                <div className="flex flex-col gap-4 -mt-24">
                                  <div className="text-xs font-bold text-byzantine-600 text-center mb-2 bg-byzantine-50 py-1 rounded">
                                    Eastern Orthodox
                                  </div>
                                  {era.events.filter(e => e.branch === "orthodox").map((event, eventIndex) => {
                                    const config = branchConfig[event.branch];
                                    
                                    return (
                                      <div key={eventIndex} className="relative group shrink-0">
                                        {/* Event card */}
                                        <div 
                                          onClick={() => handleEventClick(event)}
                                          className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer group-hover:shadow-xl group-hover:-translate-x-1 h-[240px] flex flex-col ${
                                            event.importance === "high" 
                                              ? "border-byzantine-300 bg-linear-to-br from-byzantine-50/50 to-white shadow-md hover:border-byzantine-400" 
                                              : "border-gray-200 bg-white hover:border-byzantine-300 shadow-sm"
                                          }`}
                                        >
                                          <div className="flex items-start justify-between gap-2 mb-3">
                                            <div className="flex flex-wrap gap-1.5 flex-1">
                                              <Badge className={`${config.color.split(' ')[0]} text-white text-xs font-semibold shadow-sm`}>
                                                {typeof event.year === 'number' ? `${event.year} AD` : event.year}
                                              </Badge>
                                              <Badge variant="outline" className={`text-xs ${config.textColor} border-current`}>
                                                {config.label}
                                              </Badge>
                                              {event.importance === "high" && (
                                                <Badge className="text-xs bg-linear-to-r from-orange-400 to-yellow-500 text-white border-0 shadow-sm">
                                                  ★ Key Event
                                                </Badge>
                                              )}
                                            </div>
                                            <div className="flex items-center gap-1 text-xs font-semibold text-byzantine-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                              <MessageSquare className="w-3.5 h-3.5" />
                                            </div>
                                          </div>
                                          <h5 className="font-display font-bold text-gray-900 mb-2 text-sm leading-tight group-hover:text-byzantine-700 transition-colors line-clamp-2">
                                            {event.title}
                                          </h5>
                                          <p className="text-xs text-gray-700 leading-relaxed flex-1 overflow-y-auto line-clamp-5">
                                            {event.description}
                                          </p>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                            
                            {/* Western Christianity events (bottom row) - Catholic, Protestant, Anglican, etc. */}
                            {era.events.filter(e => e.branch !== "orthodox").length > 0 && (
                              <div className="relative">
                                <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-0.5 h-12 bg-linear-to-b from-red-300 to-red-200 z-0" />
                                <div className="flex flex-col gap-4 mt-8">
                                  <div className="text-xs font-bold text-red-600 text-center mb-2 bg-red-50 py-1 rounded">
                                    Western Christianity
                                  </div>
                                  {era.events.filter(e => e.branch !== "orthodox").map((event, eventIndex) => {
                                    const config = branchConfig[event.branch];
                                    const isBranchSplit = 
                                      (event.year === 1517 && event.branch === "protestant") ||
                                      (event.year === 1534 && event.branch === "anglican");
                                    
                                    return (
                                      <div key={eventIndex} className="relative group shrink-0">
                                        {/* Branch split indicator for Protestant Reformation */}
                                        {isBranchSplit && (
                                          <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-6 h-px pointer-events-none">
                                            <div className="relative w-full h-full">
                                              <div className="absolute inset-0 bg-linear-to-r from-green-400 to-transparent opacity-50" />
                                              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-green-400 opacity-50" />
                                            </div>
                                          </div>
                                        )}
                                        
                                        {/* Event card */}
                                        <div 
                                          onClick={() => handleEventClick(event)}
                                          className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer group-hover:shadow-xl group-hover:-translate-x-1 h-[240px] flex flex-col ${
                                            event.importance === "high" 
                                              ? "border-byzantine-300 bg-linear-to-br from-byzantine-50/50 to-white shadow-md hover:border-byzantine-400" 
                                              : "border-gray-200 bg-white hover:border-byzantine-300 shadow-sm"
                                          }`}
                                        >
                                          <div className="flex items-start justify-between gap-2 mb-3">
                                            <div className="flex flex-wrap gap-1.5 flex-1">
                                              <Badge className={`${config.color.split(' ')[0]} text-white text-xs font-semibold shadow-sm`}>
                                                {typeof event.year === 'number' ? `${event.year} AD` : event.year}
                                              </Badge>
                                              <Badge variant="outline" className={`text-xs ${config.textColor} border-current`}>
                                                {config.label}
                                              </Badge>
                                              {event.importance === "high" && (
                                                <Badge className="text-xs bg-linear-to-r from-orange-400 to-yellow-500 text-white border-0 shadow-sm">
                                                  ★ Key Event
                                                </Badge>
                                              )}
                                            </div>
                                            <div className="flex items-center gap-1 text-xs font-semibold text-byzantine-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                              <MessageSquare className="w-3.5 h-3.5" />
                                            </div>
                                          </div>
                                          <h5 className="font-display font-bold text-gray-900 mb-2 text-sm leading-tight group-hover:text-byzantine-700 transition-colors line-clamp-2">
                                            {event.title}
                                          </h5>
                                          <p className="text-xs text-gray-700 leading-relaxed flex-1 overflow-y-auto line-clamp-5">
                                            {event.description}
                                          </p>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          // Before Great Schism - single unified column
                          <div>
                            <div className="absolute top-[-12px] left-1/2 -translate-x-1/2 w-0.5 h-12 bg-linear-to-b from-byzantine-300 to-byzantine-200 z-0" />
                            <div className="flex flex-col gap-4 px-2 pt-16">
                              {era.events.map((event, eventIndex) => {
                                const config = branchConfig[event.branch];
                                const isGreatSchism = event.year === 1054 && event.branch === "orthodox";
                                
                                return (
                                  <div key={eventIndex} className="relative group shrink-0">
                                    {/* Great Schism special indicator */}
                                    {isGreatSchism && (
                                      <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-6 h-px pointer-events-none">
                                        <div className="relative w-full h-full">
                                          <div className="absolute inset-0 bg-linear-to-r from-byzantine-600 to-transparent opacity-70" />
                                          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-byzantine-600 opacity-70 animate-pulse" />
                                        </div>
                                      </div>
                                    )}
                                    
                                    {/* Event card */}
                                    <div 
                                      onClick={() => handleEventClick(event)}
                                      className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer group-hover:shadow-xl group-hover:-translate-x-1 h-[240px] flex flex-col ${
                                        event.importance === "high" 
                                          ? "border-byzantine-300 bg-linear-to-br from-byzantine-50/50 to-white shadow-md hover:border-byzantine-400" 
                                          : "border-gray-200 bg-white hover:border-byzantine-300 shadow-sm"
                                      }`}
                                    >
                                      <div className="flex items-start justify-between gap-2 mb-3">
                                        <div className="flex flex-wrap gap-1.5 flex-1">
                                          <Badge className={`${config.color.split(' ')[0]} text-white text-xs font-semibold shadow-sm`}>
                                            {typeof event.year === 'number' ? `${event.year} AD` : event.year}
                                          </Badge>
                                          <Badge variant="outline" className={`text-xs ${config.textColor} border-current`}>
                                            {config.label}
                                          </Badge>
                                          {event.importance === "high" && (
                                            <Badge className="text-xs bg-linear-to-r from-orange-400 to-yellow-500 text-white border-0 shadow-sm">
                                              ★ Key Event
                                            </Badge>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-1 text-xs font-semibold text-byzantine-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                          <MessageSquare className="w-3.5 h-3.5" />
                                        </div>
                                      </div>
                                      <h5 className="font-display font-bold text-gray-900 mb-2 text-sm leading-tight group-hover:text-byzantine-700 transition-colors line-clamp-2">
                                        {event.title}
                                      </h5>
                                      <p className="text-xs text-gray-700 leading-relaxed flex-1 overflow-y-auto line-clamp-5">
                                        {event.description}
                                      </p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer note */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <MessageSquare className="w-4 h-4 text-byzantine-600" />
              <p className="text-sm font-semibold text-byzantine-700">
                Click any event to start a conversation
              </p>
            </div>
            <p className="text-xs text-gray-600 flex items-center justify-center gap-2">
              <span>Scroll horizontally to explore • Click era titles to expand/collapse</span>
              <span className="inline-block animate-bounce">→</span>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

