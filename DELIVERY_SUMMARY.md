# 🌙 AcadMate

AcadMate is a full-stack academic productivity application designed to help users manage tasks, plan work, and stay organized with the support of an AI assistant.

The application includes a task management system with priority levels, a calendar view for tracking deadlines, and a chat-based assistant that helps users plan and organize their work. All user data, including tasks and chat history, is persistently stored using Supabase.

The frontend is built using React, TypeScript, Vite, and Tailwind CSS, providing a responsive and modern user interface. The backend is developed using FastAPI in Python, which handles communication with the AI model and processes user queries.

The AI functionality is powered by Ollama running locally with the Llama 3.2 model, enabling task-aware responses and planning assistance without relying on paid APIs.

The system follows a full-stack architecture:
Frontend (React) → Supabase (Database) → FastAPI (Backend) → Ollama (Local AI)

Key features include:

Task creation, deletion, and priority management
Calendar-based task visualization
Persistent chat system with stored conversations
AI-powered assistance for planning and productivity
Daily reminders for high-priority incomplete tasks

The application can be deployed with the frontend hosted on Vercel and the database managed by Supabase. The AI component runs locally, ensuring zero-cost inference and user data privacy.