import { useState, useEffect, useRef } from 'react';
import { supabase } from './supabaseClient';
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

// Types
type Priority = 'low' | 'medium' | 'high' | 'urgent';
type Task = {
  id: string;
  title: string;
  date: string;
  priority: Priority;
  completed: boolean;
};
type Message = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
};
type ChatSession = {
  id: string;
  title: string;
  messages: Message[];
  lastUpdated: Date;
};
type TaskFilter = 'all' | 'active' | 'completed';

// Priority colors
const priorityColors = {
  low: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-300' },
  medium: { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-300' },
  high: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300' },
  urgent: { bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-300' },
};

const priorityLabels = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

// Months for calendar
const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Helper function to format dates in local time as YYYY-MM-DD
const formatTaskDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper function to get today's date in local time
const getTodayString = (): string => {
  return formatTaskDate(new Date());
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tasks' | 'calendar' | 'chat' | 'settings'>('dashboard');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<Priority>('medium');
  const [newTaskDate, setNewTaskDate] = useState(getTodayString());
  const [taskFilter, setTaskFilter] = useState<TaskFilter>('all');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editPriority, setEditPriority] = useState<Priority>('medium');
  const [editDate, setEditDate] = useState('');
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string>('');
  const [chatInput, setChatInput] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showChatSidebar, setShowChatSidebar] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Get current chat messages
  const currentMessages = chatSessions.find(s => s.id === currentChatId)?.messages || [];

  // Filter tasks based on selected filter
  const filteredTasks = tasks.filter(task => {
    if (taskFilter === 'all') return true;
    if (taskFilter === 'active') return !task.completed;
    if (taskFilter === 'completed') return task.completed;
    return true;
  });

  // Load data into supabase
  useEffect(() => {

    const loadTasks = async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });
  
      if (error) {
        console.error("Error loading tasks:", error);
        return;
      }
  
      setTasks(data || []);
    };
  
    const loadChats = async () => {
      const { data: sessions, error: sessionError } = await supabase
        .from('chat_sessions')
        .select('*')
        .order('last_updated', { ascending: false });
  
      if (sessionError) {
        console.error("Error loading sessions:", sessionError);
        return;
      }

      useEffect(() => {
        if (tasks.length === 0) return;
      
        const today = new Date().toDateString();
        const lastNotified = localStorage.getItem("acadmate-last-notified");
      
        if (lastNotified === today) return;
      
        const importantTasks = tasks.filter(
          task =>
            !task.completed &&
            (task.priority === "urgent" || task.priority === "high")
        );
      
        if (importantTasks.length === 0) return;
      
        const message = importantTasks
          .map(task => `• ${task.title} (${task.priority}, due ${task.date})`)
          .join("\n");
      
        alert(`🚨 AcadMate Reminder\n\nYou have important pending tasks:\n\n${message}`);
      
        localStorage.setItem("acadmate-last-notified", today);
      }, [tasks]);
  
      const { data: messages, error: messageError } = await supabase
        .from('messages')
        .select('*')
        .order('timestamp', { ascending: true });
  
      if (messageError) {
        console.error("Error loading messages:", messageError);
        return;
      }
  
      const formattedChats = (sessions || []).map((session: any) => ({
        id: session.id,
        title: session.title,
        lastUpdated: new Date(session.last_updated),
        messages: (messages || [])
          .filter((m: any) => m.chat_session_id === session.id)
          .map((m: any) => ({
            id: m.id,
            text: m.text,
            sender: m.sender,
            timestamp: new Date(m.timestamp),
          })),
      }));
  
      setChatSessions(formattedChats);
  
      if (formattedChats.length > 0) {
        setCurrentChatId(formattedChats[0].id);
      }
    };
  
    loadTasks();
    loadChats();
  
  }, []);



 
  // Create new chat session
  const createNewChat = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'New Conversation',
      messages: [{
        id: Date.now().toString(),
        text: "Hey there! 🌙 I'm your AcadMate assistant. I'm here to help you stay organized and supported. How are you feeling today?",
        sender: 'bot',
        timestamp: new Date(),
      }],
      lastUpdated: new Date(),
    };
    setChatSessions([newSession, ...chatSessions]);
    setCurrentChatId(newSession.id);
  };

  // Add task
  const addTask = async () => {
    if (!newTaskTitle.trim()) return;
  
    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle.trim(),
      date: newTaskDate,
      priority: newTaskPriority,
      completed: false,
    };
  
    const { error } = await supabase.from('tasks').insert(newTask);
  
    if (error) {
      console.error("Error adding task:", error);
      return;
    }
  
    setTasks([newTask, ...tasks]);
    setNewTaskTitle('');
  };

  // Delete task
  const deleteTask = async (id: string) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
  
    if (error) {
      console.error("Error deleting task:", error);
      return;
    }
  
    setTasks(tasks.filter(t => t.id !== id));
  };

  // Toggle task completion
  const toggleTaskCompletion = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
  
    const updatedCompleted = !task.completed;
  
    const { error } = await supabase
      .from('tasks')
      .update({ completed: updatedCompleted })
      .eq('id', id);
  
    if (error) {
      console.error("Error updating task:", error);
      return;
    }
  
    setTasks(tasks.map(t =>
      t.id === id ? { ...t, completed: updatedCompleted } : t
    ));
  };

  // Start editing task
  const startEditTask = (task: Task) => {
    setEditingTask(task);
    setEditTitle(task.title);
    setEditPriority(task.priority);
    setEditDate(task.date);
  };

  // Save edited task
  const saveEditTask = () => {
    if (!editingTask || !editTitle.trim()) return;
    
    setTasks(tasks.map(task =>
      task.id === editingTask.id
        ? { ...task, title: editTitle.trim(), priority: editPriority, date: editDate }
        : task
    ));
    setEditingTask(null);
    setEditTitle('');
    setEditPriority('medium');
    setEditDate('');
  };

  // Cancel editing
  const cancelEditTask = () => {
    setEditingTask(null);
    setEditTitle('');
    setEditPriority('medium');
    setEditDate('');
  };

  // Send chat message
  const sendMessage = async () => {
    console.log("SEND MESSAGE TRIGGERED");
  
    const input = chatInput.trim();
    if (!input) return;
  
    const chatIdSnapshot = currentChatId || Date.now().toString();
  
    if (!currentChatId) {
      setCurrentChatId(chatIdSnapshot);
    }
  
    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };
  
    setChatInput("");
  
    setChatSessions(prev => {
      const existingSession = prev.find(s => s.id === chatIdSnapshot);
  
      if (!existingSession) {
        return [
          {
            id: chatIdSnapshot,
            title: input.slice(0, 30),
            messages: [userMessage],
            lastUpdated: new Date(),
          },
          ...prev,
        ];
      }
  
      return prev.map(session =>
        session.id === chatIdSnapshot
          ? {
              ...session,
              messages: [...session.messages, userMessage],
              title: session.title === "New Conversation" ? input.slice(0, 30) : session.title,
              lastUpdated: new Date(),
            }
          : session
      );
    });

    await supabase.from('chat_sessions').upsert({
      id: chatIdSnapshot,
      title: input.slice(0, 30),
      last_updated: new Date().toISOString(),
    });
    
    await supabase.from('messages').insert({
      id: userMessage.id,
      chat_session_id: chatIdSnapshot,
      text: userMessage.text,
      sender: 'user',
    });
  
    try {
      console.log("ABOUT TO CALL BACKEND");
      console.log("SENDING TASKS:", tasks);
  
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input,
          tasks: tasks,
          history: currentMessages.slice(-6), // last 6 messages only
        }),
      });
  
      const data = await res.json();
      console.log("BACKEND RESPONSE:", data);
  
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response || "No response received from backend.",
        sender: "bot",
        timestamp: new Date(),
      };
  
      setChatSessions(prev =>
        prev.map(session =>
          session.id === chatIdSnapshot
            ? {
                ...session,
                messages: [...session.messages, botMessage],
                lastUpdated: new Date(),
              }
            : session
        )
      );

      await supabase.from('messages').insert({
        id: botMessage.id,
        chat_session_id: chatIdSnapshot,
        text: botMessage.text,
        sender: 'bot',
      });
      
      await supabase
        .from('chat_sessions')
        .update({
          last_updated: new Date().toISOString(),
        })
        .eq('id', chatIdSnapshot);

    } catch (error) {
      console.error("BACKEND ERROR:", error);
    }
  };
  

  // Delete chat session
  const deleteChatSession = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const newSessions = chatSessions.filter(s => s.id !== id);
    setChatSessions(newSessions);
    if (currentChatId === id && newSessions.length > 0) {
      setCurrentChatId(newSessions[0].id);
    } else if (newSessions.length === 0) {
      setCurrentChatId('');
    }
  };

  // Get tasks for selected date - using local date format
  const getTasksForDate = (date: Date) => {
    const dateStr = formatTaskDate(date);
    return tasks.filter(t => t.date === dateStr);
  };

  // Calendar days
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
  const firstDay = getFirstDayOfMonth(selectedMonth, selectedYear);

  // Navigation items
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    )},
    { id: 'tasks', label: 'Tasks', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    )},
    { id: 'calendar', label: 'Calendar', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    )},
    { id: 'chat', label: 'Chat', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    )},
    { id: 'settings', label: 'Settings', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )},
  ];

  // Get today's greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  // Render task component
  const renderTask = (task: Task, showEdit = true) => (
    <div
      key={task.id}
      className={`flex items-center justify-between p-4 rounded-xl bg-white hover:shadow-md transition-all duration-300 border-l-4 ${
        task.completed ? 'opacity-60' : ''
      } animate-slide-in`}
      style={{ borderLeftColor: task.priority === 'urgent' ? '#f43f5e' : task.priority === 'high' ? '#a855f7' : task.priority === 'medium' ? '#3b82f6' : '#94a3b8' }}
    >
      <div className="flex items-center gap-3 flex-1">
        <button
          onClick={() => toggleTaskCompletion(task.id)}
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
            task.completed
              ? 'bg-gradient-to-r from-green-400 to-emerald-500 border-green-500'
              : 'border-slate-300 hover:border-violet-400'
          }`}
        >
          {task.completed && (
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>
        <div className="flex-1">
          <p className={`font-medium ${task.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
            {task.title}
          </p>
          <p className="text-sm text-slate-400">{task.date}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${priorityColors[task.priority].bg} ${priorityColors[task.priority].text}`}>
          {priorityLabels[task.priority]}
        </span>
        {showEdit && (
          <>
            <button
              onClick={() => startEditTask(task)}
              className="p-2 rounded-lg hover:bg-blue-100 hover:text-blue-600 transition-colors"
              title="Edit task"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={() => deleteTask(task.id)}
              className="p-2 rounded-lg hover:bg-rose-100 hover:text-rose-600 transition-colors"
              title="Delete task"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen notebook-page">
      {/* Custom scrollbar & animation styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,500;0,600;1,600&display=swap');
        * {
          font-family: 'DM Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        .serif-heading, h1, h2, h3 {
          font-family: 'Playfair Display', Georgia, 'Times New Roman', serif;
          letter-spacing: 0.01em;
        }
        .notebook-page {
          background-color: #fefbf4;
          background-image:
            linear-gradient(to right, transparent 88px, rgba(244, 114, 182, 0.34) 88px, rgba(244, 114, 182, 0.34) 91px, transparent 91px),
            repeating-linear-gradient(to bottom, transparent 0px, transparent 31px, rgba(196, 181, 253, 0.42) 31px, rgba(196, 181, 253, 0.42) 33px);
          color: #44385b;
        }
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: rgba(238, 232, 250, 0.3);
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #c4b5fd, #a78bfa);
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #a78bfa, #8b5cf6);
        }
        .glass-card {
          background: #ffffff;
          border: 1px solid rgba(196, 181, 253, 0.45);
          border-radius: 30px;
          box-shadow: 0 12px 28px rgba(117, 92, 174, 0.11);
        }
        .glass-sidebar {
          background: rgba(255, 255, 255, 0.95);
          border: 1px solid rgba(196, 181, 253, 0.45);
          border-radius: 32px;
          box-shadow: 0 14px 32px rgba(117, 92, 174, 0.16);
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideOut {
          from { opacity: 1; transform: translateX(0); }
          to { opacity: 0; transform: translateX(20px); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }
        .animate-slide-in {
          animation: slideIn 0.3s ease-out forwards;
        }
        .animate-slide-out {
          animation: slideOut 0.3s ease-out forwards;
        }
        .animate-pulse-slow {
          animation: pulse 2s ease-in-out infinite;
        }
      `}</style>

      <div className="flex h-screen overflow-hidden p-4 gap-4">
        {/* Sidebar */}
        <aside className="glass-sidebar w-64 flex-shrink-0 flex flex-col">
          {/* Logo */}
          <div className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-200">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h1 className="serif-heading text-3xl italic font-semibold text-slate-700">AcadMate</h1>
                <p className="text-xs text-slate-400">Your study companion</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as typeof activeTab)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 mb-1 ${
                  activeTab === item.id
                    ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-200'
                    : 'text-slate-600 hover:bg-violet-50 hover:text-violet-600'
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* User section */}
          <div className="p-4">
            <div className="glass-card rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white font-medium">
                  S
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">Student</p>
                  <p className="text-xs text-slate-400">Free plan</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {/* Header */}
          <header className="glass-card sticky top-0 z-10 px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="serif-heading text-4xl font-semibold text-slate-800">{getGreeting()}, ✨</h2>
                <p className="text-slate-500 text-sm mt-1">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="px-4 py-2 rounded-full bg-violet-100 text-violet-600 text-sm font-medium">
                  {tasks.filter(t => !t.completed).length} pending
                </div>
                <div className="px-4 py-2 rounded-full bg-green-100 text-green-600 text-sm font-medium">
                  {tasks.filter(t => t.completed).length} completed
                </div>
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="p-8">
            {/* Dashboard */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6 animate-fade-in">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="glass-card rounded-2xl p-6 hover:shadow-lg transition-shadow duration-300">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-500 text-sm tracking-widest uppercase">To-Do</p>
                        <p className="text-3xl font-semibold text-slate-800 mt-1">
                          {tasks.filter(t => t.date === getTodayString() && !t.completed).length}
                        </p>
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  <div className="glass-card rounded-2xl p-6 hover:shadow-lg transition-shadow duration-300">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-500 text-sm tracking-widest uppercase">Done</p>
                        <p className="text-3xl font-semibold text-slate-800 mt-1">
                          {tasks.filter(t => t.completed).length}
                        </p>
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  <div className="glass-card rounded-2xl p-6 hover:shadow-lg transition-shadow duration-300">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-500 text-sm tracking-widest uppercase">Urgent</p>
                        <p className="text-3xl font-semibold text-slate-800 mt-1">
                          {tasks.filter(t => t.priority === 'urgent' && !t.completed).length}
                        </p>
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-400 to-pink-600 flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Quick Add Task */}
                  <div className="glass-card rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Quick Add Task</h3>
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        placeholder="What needs to be done?"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition-all"
                        onKeyDown={(e) => e.key === 'Enter' && addTask()}
                      />
                        <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 items-center">
                        <select
                          value={newTaskPriority}
                          onChange={(e) => setNewTaskPriority(e.target.value as Priority)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition-all bg-white"
                        >
                          <option value="low">Low Priority</option>
                          <option value="medium">Medium Priority</option>
                          <option value="high">High Priority</option>
                          <option value="urgent">Urgent</option>
                        </select>
                        <input
                          type="date"
                          value={newTaskDate}
                          onChange={(e) => setNewTaskDate(e.target.value)}
                          className="px-4 py-2 rounded-xl border border-slate-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition-all bg-white"
                        />
                        <button
                          onClick={addTask}
                          className="px-6 py-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-medium hover:shadow-lg hover:shadow-violet-200 transition-all"
                        >
                          Add Task
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Mini Chat */}
                  <div className="glass-card rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">AI Assistant</h3>
                    <div className="space-y-3">
                      <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl p-4 border border-violet-100">
                        <p className="text-slate-600 text-sm">
                          💡 <span className="font-medium">Tip:</span> Break down big tasks into smaller steps. You've got this!
                        </p>
                      </div>
                      <button
                        onClick={() => setActiveTab('chat')}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-medium hover:shadow-lg hover:shadow-violet-200 transition-all"
                      >
                        Open Chat
                      </button>
                    </div>
                  </div>
                </div>

                {/* Recent Tasks */}
                <div className="glass-card rounded-2xl p-6">
                  <h3 className="serif-heading text-3xl font-semibold text-slate-800 mb-4">Recent Notes</h3>
                  {tasks.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 rounded-full bg-violet-100 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <p className="text-slate-500">No tasks yet. Add your first task above!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {tasks.slice(0, 5).map((task) => renderTask(task))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tasks Tab */}
            {activeTab === 'tasks' && (
              <div className="space-y-6 animate-fade-in">
                <div className="glass-card rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">Add New Task</h3>
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      placeholder="What needs to be done?"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition-all"
                      onKeyPress={(e) => e.key === 'Enter' && addTask()}
                    />
                    <div className="flex gap-3 flex-wrap">
                      <select
                        value={newTaskPriority}
                        onChange={(e) => setNewTaskPriority(e.target.value as Priority)}
                        className="px-4 py-2 rounded-xl border border-slate-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition-all bg-white"
                      >
                        <option value="low">Low Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="high">High Priority</option>
                        <option value="urgent">Urgent</option>
                      </select>
                      <input
                        type="date"
                        value={newTaskDate}
                        onChange={(e) => setNewTaskDate(e.target.value)}
                        className="px-4 py-2 rounded-xl border border-slate-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition-all bg-white"
                      />
                      <button
                        onClick={addTask}
                        className="px-6 py-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-medium hover:shadow-lg hover:shadow-violet-200 transition-all"
                      >
                        Add Task
                      </button>
                    </div>
                  </div>
                </div>

                {/* Filter Buttons */}
                <div className="glass-card rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-800">All Tasks ({filteredTasks.length})</h3>
                    <div className="flex gap-2">
                      {(['all', 'active', 'completed'] as TaskFilter[]).map((filter) => (
                        <button
                          key={filter}
                          onClick={() => setTaskFilter(filter)}
                          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                            taskFilter === filter
                              ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {filter.charAt(0).toUpperCase() + filter.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {filteredTasks.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 rounded-full bg-violet-100 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <p className="text-slate-500">
                        {taskFilter === 'all' 
                          ? 'No tasks yet. Add your first task above!'
                          : taskFilter === 'active'
                          ? 'No active tasks. Great job! 🎉'
                          : 'No completed tasks yet. Keep going! 💪'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredTasks.map((task) => renderTask(task))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Calendar Tab */}
            {activeTab === 'calendar' && (
              <div className="space-y-6 animate-fade-in">
                <div className="glass-card rounded-2xl p-6">
                  {/* Calendar Header */}
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-slate-800">
                      {months[selectedMonth]} {selectedYear}
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          if (selectedMonth === 0) {
                            setSelectedMonth(11);
                            setSelectedYear(selectedYear - 1);
                          } else {
                            setSelectedMonth(selectedMonth - 1);
                          }
                        }}
                        className="p-2 rounded-xl hover:bg-violet-100 transition-colors"
                      >
                        <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setSelectedDate(new Date())}
                        className="px-4 py-2 rounded-xl bg-violet-100 text-violet-600 font-medium hover:bg-violet-200 transition-colors"
                      >
                        Today
                      </button>
                      <button
                        onClick={() => {
                          if (selectedMonth === 11) {
                            setSelectedMonth(0);
                            setSelectedYear(selectedYear + 1);
                          } else {
                            setSelectedMonth(selectedMonth + 1);
                          }
                        }}
                        className="p-2 rounded-xl hover:bg-violet-100 transition-colors"
                      >
                        <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-2 mb-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                      <div key={day} className="text-center text-sm font-medium text-slate-400 py-2">
                        {day}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: firstDay }).map((_, i) => (
                      <div key={`empty-${i}`} className="aspect-square" />
                    ))}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const day = i + 1;
                      const currentDate = new Date(selectedYear, selectedMonth, day);
                      // Use local date format for comparisons
                      const currentDateString = formatTaskDate(currentDate);
                      const todayString = getTodayString();
                      const selectedDateString = formatTaskDate(selectedDate);
                      
                      const isToday = currentDateString === todayString;
                      const isSelected = currentDateString === selectedDateString;
                      const dayTasks = getTasksForDate(currentDate);
                      const pendingTasks = dayTasks.filter(t => !t.completed);
                      
                      return (
                        <button
                          key={day}
                          onClick={() => setSelectedDate(currentDate)}
                          className={`aspect-square rounded-xl flex flex-col items-center justify-center transition-all ${
                            isSelected
                              ? 'bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-200'
                              : isToday
                              ? 'bg-violet-100 text-violet-700 hover:bg-violet-200'
                              : 'hover:bg-violet-50 text-slate-700'
                          }`}
                        >
                          <span className="text-sm font-medium">{day}</span>
                          {pendingTasks.length > 0 && (
                            <div className="flex gap-0.5 mt-1">
                              {pendingTasks.slice(0, 3).map((task, idx) => (
                                <div
                                  key={idx}
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    task.priority === 'urgent' ? 'bg-rose-400' :
                                    task.priority === 'high' ? 'bg-purple-400' :
                                    task.priority === 'medium' ? 'bg-blue-400' : 'bg-slate-400'
                                  }`}
                                />
                              ))}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Selected Date Tasks */}
                <div className="glass-card rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">
                    Tasks for {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                  </h3>
                  
                  {/* Add Task for Selected Date */}
                  <div className="mb-4 p-4 rounded-xl bg-violet-50 border border-violet-100">
                    <input
                      type="text"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      placeholder="Add a task for this day..."
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition-all mb-3"
                      onKeyPress={(e) => e.key === 'Enter' && addTask()}
                    />
                    <div className="flex gap-3 flex-wrap">
                      <select
                        value={newTaskPriority}
                        onChange={(e) => setNewTaskPriority(e.target.value as Priority)}
                        className="px-4 py-2 rounded-lg border border-slate-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition-all bg-white"
                      >
                        <option value="low">Low Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="high">High Priority</option>
                        <option value="urgent">Urgent</option>
                      </select>
                      <input
                        type="date"
                        value={newTaskDate}
                        onChange={(e) => setNewTaskDate(e.target.value)}
                        className="px-4 py-2 rounded-lg border border-slate-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition-all bg-white"
                      />
                      <button
                        onClick={addTask}
                        className="px-6 py-2 rounded-lg bg-gradient-to-r from-violet-500 to-purple-600 text-white font-medium hover:shadow-lg hover:shadow-violet-200 transition-all"
                      >
                        Add Task
                      </button>
                    </div>
                  </div>

                  {/* Tasks List */}
                  <div className="space-y-3">
                    {getTasksForDate(selectedDate).length === 0 ? (
                      <div className="text-center py-6">
                        <p className="text-slate-400">No tasks for this day. Add one above!</p>
                      </div>
                    ) : (
                      getTasksForDate(selectedDate).map((task) => renderTask(task))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Chat Tab */}
            {activeTab === 'chat' && (
              <div className="flex h-[calc(100vh-140px)] animate-fade-in">
                {/* Chat History Sidebar (ChatGPT style) */}
                <div className={`${showChatSidebar ? 'w-72' : 'w-0'} glass-card rounded-2xl transition-all duration-300 overflow-hidden flex flex-col`}>
                  <div className="p-4 border-b border-slate-200">
                    <button
                      onClick={createNewChat}
                      className="w-full flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-medium hover:shadow-lg hover:shadow-violet-200 transition-all"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      New Chat
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {chatSessions.map((session) => (
                      <div
                        key={session.id}
                        onClick={() => setCurrentChatId(session.id)}
                        className={`group flex items-center gap-2 p-3 rounded-xl cursor-pointer transition-all ${
                          currentChatId === session.id
                            ? 'bg-violet-100'
                            : 'hover:bg-violet-50'
                        }`}
                      >
                        <svg className="w-4 h-4 text-slate-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                        <span className="text-sm text-slate-700 truncate flex-1">{session.title}</span>
                        <button
                          onClick={(e) => deleteChatSession(e, session.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-rose-100 hover:text-rose-600 transition-all"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Toggle Sidebar Button */}
                <button
                  onClick={() => setShowChatSidebar(!showChatSidebar)}
                  className="mx-2 p-2 rounded-lg hover:bg-violet-100 transition-colors"
                >
                  <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>

                {/* Chat Area */}
                <div className="flex-1 glass-card rounded-2xl p-6 flex flex-col overflow-hidden">
                  {!currentChatId ? (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
                          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-slate-800 mb-2">Welcome to AcadMate Chat</h3>
                        <p className="text-slate-500 mb-6">Select a conversation or start a new one</p>
                        <button
                          onClick={createNewChat}
                          className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-medium hover:shadow-lg hover:shadow-violet-200 transition-all"
                        >
                          Start New Conversation
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-200">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-800">AcadMate Assistant</h3>
                          <p className="text-sm text-slate-400">{formatDate(chatSessions.find(s => s.id === currentChatId)?.lastUpdated || new Date())}</p>
                        </div>
                      </div>

                      {/* Messages */}
                      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                        {currentMessages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[70%] px-4 py-3 rounded-2xl ${
                                message.sender === 'user'
                                  ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-br-md'
                                  : 'bg-white text-slate-700 rounded-bl-md shadow-sm border border-slate-100'
                              }`}
                            >
                              <p className="text-sm">{message.text}</p>
                              <p className={`text-xs mt-1 ${message.sender === 'user' ? 'text-violet-200' : 'text-slate-400'}`}>
                                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                        ))}
                        <div ref={chatEndRef} />
                      </div>

                      {/* Input */}
                      <div className="flex gap-3">
                        <input
                          type="text"
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          placeholder="Type a message..."
                          className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition-all"
                          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        />
                        <button
                          onClick={sendMessage}
                          className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-medium hover:shadow-lg hover:shadow-violet-200 transition-all"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6 animate-fade-in">
                <div className="glass-card rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-slate-800 mb-6">Settings</h3>
                  
                  <div className="space-y-6">
                    {/* Profile Section */}
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-violet-50 border border-violet-100">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-2xl font-medium">
                        S
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">Student Account</p>
                        <p className="text-sm text-slate-400">Free plan</p>
                      </div>
                    </div>

                    {/* Notification Settings */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-slate-700">Notifications</h4>
                      <div className="flex items-center justify-between p-4 rounded-xl bg-white border border-slate-200">
                        <div>
                          <p className="font-medium text-slate-700">Daily Reminders</p>
                          <p className="text-sm text-slate-400">Get reminded about your tasks each day</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-violet-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-500"></div>
                        </label>
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-xl bg-white border border-slate-200">
                        <div>
                          <p className="font-medium text-slate-700">Task Due Notifications</p>
                          <p className="text-sm text-slate-400">Get notified when tasks are due</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-violet-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-500"></div>
                        </label>
                      </div>
                    </div>

                    {/* Appearance Settings */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-slate-700">Appearance</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <button className="p-4 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white font-medium border-2 border-violet-500">
                          Light Theme
                        </button>
                        <button className="p-4 rounded-xl bg-slate-100 text-slate-600 font-medium hover:bg-slate-200 transition-colors">
                          Dark Theme
                        </button>
                      </div>
                    </div>

                    {/* Data Management */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-slate-700">Data</h4>
                      <div className="flex items-center justify-between p-4 rounded-xl bg-white border border-slate-200">
                        <div>
                          <p className="font-medium text-slate-700">Clear All Data</p>
                          <p className="text-sm text-slate-400">Remove all tasks and chat history</p>
                        </div>
                        <button
                          onClick={() => {
                            if (confirm('Are you sure? This will delete all your data.')) {
                              localStorage.removeItem('acadmate-tasks');
                              localStorage.removeItem('acadmate-chats');
                              setTasks([]);
                              setChatSessions([]);
                              setCurrentChatId('');
                            }
                          }}
                          className="px-4 py-2 rounded-lg bg-rose-100 text-rose-600 font-medium hover:bg-rose-200 transition-colors"
                        >
                          Clear Data
                        </button>
                      </div>
                    </div>

                    {/* About */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <h4 className="font-medium text-slate-700 mb-2">About AcadMate</h4>
                      <p className="text-sm text-slate-500">
                        AcadMate is your personal academic and emotional productivity assistant. 
                        Stay organized, motivated, and supported on your learning journey.
                      </p>
                      <p className="text-xs text-slate-400 mt-2">Version 1.2.0</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Edit Task Modal */}
        {editingTask && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
            <div className="glass-card rounded-2xl p-6 w-full max-w-md mx-4 animate-slide-in">
              <h3 className="text-xl font-semibold text-slate-800 mb-4">Edit Task</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Task Title</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition-all"
                    placeholder="Enter task title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Priority</label>
                  <select
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value as Priority)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition-all bg-white"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Due Date</label>
                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition-all bg-white"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={cancelEditTask}
                    className="flex-1 px-4 py-3 rounded-xl bg-slate-100 text-slate-700 font-medium hover:bg-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveEditTask}
                    className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-medium hover:shadow-lg hover:shadow-violet-200 transition-all"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
