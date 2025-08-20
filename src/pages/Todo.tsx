import React, { useState, useEffect } from 'react';
import { Trash2, Edit2, Check, X, Plus } from 'lucide-react';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
}

type FilterType = 'all' | 'active' | 'completed';

const Todo = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');

  // Load todos from localStorage on component mount
  useEffect(() => {
    const savedTodos = localStorage.getItem('todos');
    if (savedTodos) {
      const parsedTodos = JSON.parse(savedTodos).map((todo: any) => ({
        ...todo,
        createdAt: new Date(todo.createdAt)
      }));
      setTodos(parsedTodos);
    }
  }, []);

  // Save todos to localStorage whenever todos change
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  const addTodo = () => {
    if (inputValue.trim() !== '') {
      const newTodo: Todo = {
        id: Date.now().toString(),
        text: inputValue.trim(),
        completed: false,
        createdAt: new Date()
      };
      setTodos([newTodo, ...todos]);
      setInputValue('');
    }
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const startEditing = (id: string, text: string) => {
    setEditingId(id);
    setEditingText(text);
  };

  const saveEdit = () => {
    if (editingText.trim() !== '') {
      setTodos(todos.map(todo => 
        todo.id === editingId ? { ...todo, text: editingText.trim() } : todo
      ));
    }
    setEditingId(null);
    setEditingText('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingText('');
  };

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  const completedCount = todos.filter(todo => todo.completed).length;
  const activeCount = todos.filter(todo => !todo.completed).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <h1 className="text-3xl font-bold text-white text-center">My Todo List</h1>
            <p className="text-blue-100 text-center mt-2">Stay organized and productive</p>
          </div>

          {/* Add Todo Form */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex gap-3">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTodo()}
                placeholder="Add a new task..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={addTodo}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 flex items-center gap-2"
              >
                <Plus size={20} />
                Add
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-center gap-1">
              {(['all', 'active', 'completed'] as FilterType[]).map((filterType) => (
                <button
                  key={filterType}
                  onClick={() => setFilter(filterType)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    filter === filterType
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                  {filterType === 'active' && activeCount > 0 && (
                    <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                      {activeCount}
                    </span>
                  )}
                  {filterType === 'completed' && completedCount > 0 && (
                    <span className="ml-2 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                      {completedCount}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Todo List */}
          <div className="max-h-96 overflow-y-auto">
            {filteredTodos.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <div className="text-6xl mb-4">📝</div>
                <p className="text-lg">
                  {filter === 'all' ? 'No tasks yet. Add one above!' :
                   filter === 'active' ? 'No active tasks!' :
                   'No completed tasks!'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredTodos.map((todo) => (
                  <div key={todo.id} className="p-4 hover:bg-gray-50 transition-colors duration-200">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleTodo(todo.id)}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors duration-200 ${
                          todo.completed
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'border-gray-300 hover:border-green-500'
                        }`}
                      >
                        {todo.completed && <Check size={16} />}
                      </button>
                      
                      {editingId === todo.id ? (
                        <div className="flex-1 flex gap-2">
                          <input
                            type="text"
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
                            className="flex-1 px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                          />
                          <button
                            onClick={saveEdit}
                            className="p-1 text-green-600 hover:bg-green-100 rounded"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="p-1 text-red-600 hover:bg-red-100 rounded"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className={`flex-1 ${
                            todo.completed 
                              ? 'text-gray-500 line-through' 
                              : 'text-gray-900'
                          }`}>
                            {todo.text}
                          </span>
                          <div className="flex gap-1">
                            <button
                              onClick={() => startEditing(todo.id, todo.text)}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors duration-200"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => deleteTodo(todo.id)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors duration-200"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Stats */}
          {todos.length > 0 && (
            <div className="px-6 py-4 bg-gray-50 text-center text-sm text-gray-600">
              Total: {todos.length} | Active: {activeCount} | Completed: {completedCount}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Todo;