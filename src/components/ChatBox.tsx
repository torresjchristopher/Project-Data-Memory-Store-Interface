import React, { useState, useEffect, useRef } from 'react';
import { Send, UserPlus, X, Paperclip, MessageSquare, User, Globe, StickyNote } from 'lucide-react';
import { ChatService } from '../services/ChatService';
import type { ChatMessage } from '../services/ChatService';
import { motion, AnimatePresence } from 'framer-motion';
import type { Person } from '../types';

interface ChatBoxProps {
  currentFamily: { name: string, slug: string };
  currentUser: Person;
  people: Person[];
  attachedArtifact?: { id: string, name: string };
  onSelectArtifact: (id: string) => void;
  onInputActive?: (isActive: boolean) => void;
  onModeChange?: (mode: 'dm' | 'note') => void;
  initialMode?: 'dm' | 'note';
}

export const ChatBox: React.FC<ChatBoxProps> = ({ currentFamily, currentUser, people, attachedArtifact, onSelectArtifact, onInputActive, onModeChange, initialMode = 'dm' }) => {
  const [mode, setMode] = useState<'dm' | 'note'>(initialMode);
  const [participants, setParticipants] = useState<{id: string, name: string, type: 'family' | 'person' | 'global'}[]>([]);
  const [searchTerm, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{id: string, name: string, type: 'family' | 'person' | 'global'}[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLinkingActive, setIsLinkingActive] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chatService = ChatService.getInstance();

  useEffect(() => {
    onModeChange?.(mode);
  }, [mode, onModeChange]);

  useEffect(() => {
    if (mode === 'note' && attachedArtifact) {
        return chatService.subscribeToArtifactMessages(attachedArtifact.id, setMessages);
    } else if (participants.length > 0) {
      // Chat ID is derived from personal IDs to ensure unique threads within family members
      const pIds = Array.from(new Set([currentFamily.slug, currentUser.id, ...participants.map(p => p.id)]));
      return chatService.subscribeToMessages(pIds, setMessages);
    } else {
      setMessages([]);
    }
  }, [participants, currentFamily.slug, mode, attachedArtifact?.id, currentUser.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    onInputActive?.(inputText.length > 0);
  }, [inputText, onInputActive]);

  const handleSearch = async (val: string) => {
    if (mode === 'note') return;
    setSearchQuery(val);
    if (val.length === 0) {
        setSearchResults([]);
        return;
    }

    const term = val.toLowerCase();
    let combined: any[] = [];

    if ("the murray family".includes(term) || "global".includes(term)) {
        combined.push({ id: 'GLOBAL_BROADCAST', name: 'The Murray Family', type: 'global' });
    }

    if (term.includes('.')) {
        const [fSlug, pName] = term.split('.');
        const familyPeople = await chatService.getFamilyPeople(fSlug);
        combined = [...combined, ...familyPeople
            .filter(p => p.name.toLowerCase().includes(pName))
            .map(p => ({ ...p, type: 'person' }))];
    } else {
        const familyResults = await chatService.searchParticipants(val, currentFamily.slug);
        const personResults = people
            .filter(p => p.id !== 'FAMILY_ROOT' && p.name.toLowerCase().includes(term))
            .map(p => ({ id: p.id, name: p.name, type: 'person' as const }));
        
        combined = [...combined, ...familyResults, ...personResults];
    }

    setSearchResults(combined.filter(r => !participants.find(p => p.id === r.id)).slice(0, 6));
  };

  const addParticipant = (p: {id: string, name: string, type: 'family' | 'person' | 'global'}) => {
    setParticipants([...participants, p]);
    setSearchQuery('');
    setSearchResults([]);
  };

  const removeParticipant = (id: string) => {
    setParticipants(participants.filter(p => p.id !== id));
  };

  const handleSend = async () => {
    const isNote = mode === 'note';
    const hasAttachment = (attachedArtifact && isLinkingActive) || isNote;
    if (!inputText.trim() && !hasAttachment) return;
    if (!isNote && participants.length === 0) return;

    // Participants MUST include both the family slug and the current person ID
    const pIds = isNote ? [currentFamily.slug, currentUser.id] : Array.from(new Set([currentFamily.slug, currentUser.id, ...participants.map(p => p.id)]));
    
    await chatService.sendMessage(
      pIds,
      currentFamily.slug,
      `${currentFamily.name.split(' ')[1]} // ${currentUser.name}`, 
      inputText,
      hasAttachment ? attachedArtifact : undefined,
      currentUser.id
    );
    setInputText('');
  };

  return (
    <div className="flex flex-col pointer-events-auto font-sans">
      
      {/* Mode Toggle Header */}
      <div className="flex gap-2 mb-2 px-2 opacity-40 hover:opacity-100 transition-opacity">
          <button 
            onClick={() => setMode('dm')} 
            className={`p-1.5 rounded-full transition-all ${mode === 'dm' ? 'bg-black text-white shadow-lg' : 'text-black hover:bg-black/5'}`}
            title="DM Mode"
          >
              <MessageSquare className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={() => setMode('note')} 
            className={`p-1.5 rounded-full transition-all ${mode === 'note' ? 'bg-emerald-500 text-black shadow-lg' : 'text-black hover:bg-black/5'}`}
            title="Note Mode"
          >
              <StickyNote className="w-3.5 h-3.5" />
          </button>
      </div>

      {/* Control Bar (Submission Box) - NOW ABOVE STREAM OR INTEGRATED */}
      <div className="flex items-center gap-4 bg-white/90 backdrop-blur-xl border border-black/10 rounded-sm p-4 shadow-2xl mb-2">
        {mode === 'dm' && (
            <div className="relative">
                <input 
                    type="text" 
                    placeholder="SEARCH..." 
                    className="w-24 bg-transparent border-none text-[10px] text-black focus:ring-0 p-0 uppercase tracking-widest font-black placeholder:text-black/40 outline-none"
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                />
                <AnimatePresence>
                  {searchResults.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute z-[110] left-0 bottom-full mb-4 bg-white border border-black/10 rounded-sm shadow-2xl overflow-hidden min-w-[200px]">
                      {searchResults.map(r => (
                        <div key={r.id} className="p-3 hover:bg-emerald-500/5 cursor-pointer border-b border-black/5 last:border-0 flex items-center justify-between group transition-colors" onClick={() => addParticipant(r)}>
                          <div className="flex items-center gap-2.5 text-black">
                              {r.type === 'family' ? <MessageSquare className="w-3 h-3 opacity-40" /> : r.type === 'global' ? <Globe className="w-3 h-3 text-emerald-500" /> : <User className="w-3 h-3 opacity-40" />}
                              <span className="text-[9px] font-black uppercase tracking-widest">{r.name}</span>
                          </div>
                          <UserPlus className="w-3 h-3 text-black/20 group-hover:text-emerald-500 transition-colors" />
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
            </div>
        )}

        {mode === 'dm' && <div className="h-4 w-px bg-black/10" />}

        <div className="flex-1 flex items-center gap-3">
          {mode === 'dm' && (
              <button 
                onClick={() => setIsLinkingActive(!isLinkingActive)}
                className={`transition-all hover:scale-110 ${isLinkingActive ? 'text-emerald-500' : 'text-black/20'}`}
                title="Link Artifact"
              >
                <Paperclip className="w-3.5 h-3.5" />
              </button>
          )}
          
          <input 
            type="text" 
            placeholder={mode === 'note' ? "ADD NOTE..." : "ADD MESSAGE..."} 
            className="flex-1 bg-transparent border-none text-[10px] font-black text-black focus:ring-0 p-0 uppercase tracking-widest placeholder:text-black/40 outline-none"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          
          <button 
            onClick={handleSend}
            className="bg-transparent text-black opacity-40 hover:opacity-100 hover:text-emerald-500 transition-all active:scale-95 flex items-center justify-center p-0 outline-none"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>

        {mode === 'dm' && participants.length > 0 && (
            <div className="flex gap-1 ml-2">
                {participants.map(p => (
                    <div key={p.id} className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-[8px] font-black text-white relative group">
                        {p.name[0]}
                        <X className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-black rounded-full p-0.5 opacity-0 group-hover:opacity-100 cursor-pointer shadow-lg" onClick={() => removeParticipant(p.id)} />
                    </div>
                ))}
            </div>
        )}
      </div>

      {/* Message Stream */}
      <div className={`overflow-y-auto px-2 space-y-4 no-scrollbar transition-all duration-500 ease-in-out ${messages.length > 0 ? 'flex-1 py-2 opacity-100' : 'h-0 py-0 opacity-0 pointer-events-none'}`}>
          {messages.map((m, i) => (
            <div key={i} className={`flex flex-col ${m.senderPersonId === currentUser.id ? 'items-end' : 'items-start'}`}>
              <div className="text-[6px] font-black text-black opacity-40 uppercase tracking-[0.2em] mb-1 px-1">{m.senderName}</div>
              <div className={`w-fit max-w-[90%] p-2.5 rounded-sm text-[10px] leading-snug font-black transition-colors ${
                m.senderPersonId === currentUser.id 
                ? 'bg-emerald-500 text-black shadow-sm' 
                : 'bg-white border border-black/10 text-black shadow-sm'
              }`}>
                {m.text}
                {m.artifactId && mode === 'dm' && (
                  <div 
                    className="mt-2 p-1.5 bg-black/10 rounded-sm flex items-center gap-2 cursor-pointer hover:bg-black/20 transition-all group"
                    onClick={() => onSelectArtifact(m.artifactId!)}
                  >
                    <Paperclip className="w-2.5 h-2.5 text-black" />
                    <span className="text-[7px] font-black uppercase truncate tracking-tighter text-black">Artifact</span>
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
      </div>
    </div>
  );
};