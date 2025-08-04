'use client';

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useState } from "react";

interface TodoItem {
  id: string;
  task: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  timeRecommendation?: string;
}

export default function TodoListCard() {
  const [todos, setTodos] = useState<TodoItem[]>([
    {
      id: '1',
      task: 'আজ সন্ধ্যায় জমিতে ৩০ মিনিট সেচ দিন।',
      completed: false,
      priority: 'high',
      timeRecommendation: 'সন্ধ্যা ৬টা'
    },
    {
      id: '2',
      task: 'এখন কীটনাশক ব্যবহার করবেন না, বৃষ্টি হতে পারে।',
      completed: false,
      priority: 'high'
    },
    {
      id: '3',
      task: 'টমেটো গাছের নিচের পাতা পরিষ্কার করুন।',
      completed: true,
      priority: 'medium'
    },
    {
      id: '4',
      task: 'আগামীকাল সকালে মাটির আর্দ্রতা পরীক্ষা করুন।',
      completed: false,
      priority: 'medium',
      timeRecommendation: 'সকাল ৮টা'
    }
  ]);

  const toggleTodo = (id: string) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const getPriorityIcon = (priority: TodoItem['priority']) => {
    switch (priority) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
    }
  };

  const completedCount = todos.filter(todo => todo.completed).length;
  const totalCount = todos.length;

  return (
    <Card className="shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            📋 আজকের কাজের তালিকা
          </h2>
          <div className="flex items-center space-x-2">
            <div className="text-sm text-gray-500">
              {completedCount}/{totalCount} সম্পন্ন
            </div>
            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 transition-all duration-300"
                style={{ width: `${(completedCount / totalCount) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {todos.map((todo) => (
          <div
            key={todo.id}
            className={`flex items-start space-x-3 p-3 rounded-lg border transition-all duration-200 hover:shadow-sm ${
              todo.completed 
                ? 'bg-green-50 border-green-200' 
                : 'bg-white border-gray-200 hover:border-green-300'
            }`}
          >
            {/* Checkbox */}
            <button
              onClick={() => toggleTodo(todo.id)}
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                todo.completed
                  ? 'bg-green-500 border-green-500 text-white'
                  : 'border-gray-300 hover:border-green-500'
              }`}
            >
              {todo.completed && (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>

            {/* Priority & Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start space-x-2">
                <span className="text-sm flex-shrink-0">
                  {getPriorityIcon(todo.priority)}
                </span>
                <div className="flex-1">
                  <p className={`text-sm leading-relaxed ${
                    todo.completed 
                      ? 'text-gray-500 line-through' 
                      : 'text-gray-800'
                  }`}>
                    {todo.task}
                  </p>
                  {todo.timeRecommendation && !todo.completed && (
                    <div className="flex items-center mt-2">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        ⏰ {todo.timeRecommendation}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* AI Generated Note */}
        <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
          <div className="flex items-start space-x-2">
            <span className="text-lg">🤖</span>
            <div>
              <p className="text-sm text-gray-700">
                <strong>AI পরামর্শ:</strong> আজকের আবহাওয়া অনুযায়ী এই কাজগুলো সবচেয়ে গুরুত্বপূর্ণ।
              </p>
              <p className="text-xs text-gray-500 mt-1">
                প্রতিদিন সকাল ৮টায় নতুন তালিকা আপডেট হয়
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
