import React, { useState } from 'react';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Star, MoreHorizontal, Edit, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  sender: string;
  avatar?: string;
  subject: string;
  preview: string;
  date: string;
  isStarred: boolean;
  isRead: boolean;
  folder: 'inbox' | 'sent' | 'drafts' | 'archived';
}

/**
 * Messages page component
 * Displays a list of messages with a conversation view
 */
const Messages = () => {
  const [selectedFolder, setSelectedFolder] = useState<'inbox' | 'sent' | 'drafts' | 'archived'>('inbox');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Sample messages data
  const messages: Message[] = [
    {
      id: '1',
      sender: 'John Smith',
      subject: 'Interview Feedback',
      preview: 'I wanted to share my thoughts on the candidate we interviewed yesterday...',
      date: 'Today, 10:30 AM',
      isStarred: true,
      isRead: false,
      folder: 'inbox'
    },
    {
      id: '2',
      sender: 'Sarah Johnson',
      subject: 'New candidate application',
      preview: 'We received a promising application for the Senior Developer position...',
      date: 'Yesterday, 3:45 PM',
      isStarred: false,
      isRead: true,
      folder: 'inbox'
    },
    {
      id: '3',
      sender: 'Michael Brown',
      subject: 'Meeting rescheduled',
      preview: 'The team meeting has been moved to Thursday at 2 PM instead of Wednesday...',
      date: 'May 10, 2023',
      isStarred: false,
      isRead: true,
      folder: 'inbox'
    },
    {
      id: '4',
      sender: 'Emily Davis',
      subject: 'Onboarding documents',
      preview: 'Please find attached the onboarding documents for our new hire starting next week...',
      date: 'May 8, 2023',
      isStarred: true,
      isRead: true,
      folder: 'inbox'
    },
    {
      id: '5',
      sender: 'David Wilson',
      subject: 'Quarterly hiring report',
      preview: 'Here is the Q2 hiring report with our progress against targets and key metrics...',
      date: 'May 5, 2023',
      isStarred: false,
      isRead: true,
      folder: 'inbox'
    },
    {
      id: '6',
      sender: 'Lisa Taylor',
      subject: 'Candidate withdrew application',
      preview: 'Unfortunately, the candidate for the UX Designer position has decided to withdraw...',
      date: 'May 3, 2023',
      isStarred: false,
      isRead: true,
      folder: 'inbox'
    },
    {
      id: '7',
      sender: 'Robert Martinez',
      subject: 'Interview scheduling',
      preview: 'Can we schedule the technical interviews for next week? I have availability on...',
      date: 'May 1, 2023',
      isStarred: false,
      isRead: true,
      folder: 'inbox'
    }
  ];

  // Filter messages based on selected folder and search query
  const filteredMessages = messages.filter(message => 
    message.folder === selectedFolder && 
    (searchQuery === '' || 
      message.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.preview.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Folder options
  const folders = [
    { id: 'inbox', name: 'Inbox', count: messages.filter(m => m.folder === 'inbox').length },
    { id: 'sent', name: 'Sent', count: messages.filter(m => m.folder === 'sent').length },
    { id: 'drafts', name: 'Drafts', count: messages.filter(m => m.folder === 'drafts').length },
    { id: 'archived', name: 'Archived', count: messages.filter(m => m.folder === 'archived').length }
  ];

  const handleMessageClick = (message: Message) => {
    setSelectedMessage(message);
  };

  const handleStarClick = (messageId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // In a real app, this would update the message in the database
    console.log(`Toggled star for message ${messageId}`);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-white">
      {/* Left sidebar - Folders */}
      <div className="w-48 border-r border-gray-200 p-4">
        <h2 className="text-lg font-semibold mb-4">Messages</h2>
        <ul className="space-y-1">
          {folders.map(folder => (
            <li key={folder.id}>
              <button
                className={cn(
                  "w-full text-left px-3 py-2 rounded-md text-sm font-medium flex justify-between items-center",
                  selectedFolder === folder.id 
                    ? "bg-ats-blue/10 text-ats-blue" 
                    : "text-gray-600 hover:bg-gray-100"
                )}
                onClick={() => setSelectedFolder(folder.id as any)}
              >
                <span>{folder.name}</span>
                <span className="bg-gray-200 text-gray-700 rounded-full px-2 py-0.5 text-xs">
                  {folder.count}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Middle section - Message list */}
      <div className="w-80 border-r border-gray-200 flex flex-col">
        <div className="p-3 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search messages"
              className="pl-9 bg-gray-50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="flex-1 overflow-auto">
          {filteredMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <p>No messages found</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filteredMessages.map(message => (
                <li 
                  key={message.id}
                  className={cn(
                    "hover:bg-gray-50 cursor-pointer",
                    message.isRead ? "bg-white" : "bg-blue-50",
                    selectedMessage?.id === message.id ? "bg-gray-100" : ""
                  )}
                  onClick={() => handleMessageClick(message)}
                >
                  <div className="px-4 py-3">
                    <div className="flex justify-between items-start">
                      <span className="font-medium text-sm">{message.sender}</span>
                      <div className="flex items-center space-x-1">
                        <span className="text-xs text-gray-500">{message.date}</span>
                        <button 
                          className="text-gray-400 hover:text-yellow-400"
                          onClick={(e) => handleStarClick(message.id, e)}
                        >
                          <Star className="h-4 w-4" fill={message.isStarred ? "currentColor" : "none"} />
                        </button>
                      </div>
                    </div>
                    <div className="font-medium text-sm mt-1">{message.subject}</div>
                    <div className="text-xs text-gray-500 mt-1 truncate">{message.preview}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Right section - Message content */}
      <div className="flex-1 flex flex-col">
        {selectedMessage ? (
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">{selectedMessage.subject}</h2>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center mt-4">
                <Avatar className="h-10 w-10 mr-3">
                  <div className="bg-ats-blue text-white flex items-center justify-center h-full w-full rounded-full text-sm font-medium">
                    {selectedMessage.sender.split(' ').map(n => n[0]).join('')}
                  </div>
                </Avatar>
                <div>
                  <div className="font-medium">{selectedMessage.sender}</div>
                  <div className="text-sm text-gray-500">{selectedMessage.date}</div>
                </div>
              </div>
            </div>
            <div className="p-4 flex-1 overflow-auto">
              <p className="text-gray-700">
                {selectedMessage.preview}
                <br /><br />
                This is a placeholder for the full message content. In a real application, this would display the complete message text.
              </p>
            </div>
            <div className="p-4 border-t border-gray-200">
              <Button className="bg-ats-blue hover:bg-ats-dark-blue text-white">
                <MessageSquare className="h-4 w-4 mr-2" />
                Reply
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <div className="bg-gray-100 rounded-full p-4 mb-4">
              <MessageSquare className="h-8 w-8" />
            </div>
            <p className="text-lg font-medium">No message selected</p>
            <p className="text-sm">Select a message to view its contents</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => {
                // In a real app, this would open a compose message dialog
              }}
            >
              <Edit className="h-4 w-4 mr-2" />
              Compose new message
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
