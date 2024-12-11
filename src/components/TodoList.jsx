// src/components/TodoList.jsx
import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash2, CheckCircle, Circle, Calendar, Tag, AlertTriangle, Search, ChevronUp, ChevronDown, Edit2, X, Plus, Minus } from 'lucide-react';
import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  updateDoc, 
  doc, 
  query, 
  onSnapshot,
  orderBy 
} from 'firebase/firestore';

const PRIORITY_LEVELS = {
  LOW: { label: 'Low', color: 'bg-green-100 text-green-800' },
  MEDIUM: { label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  HIGH: { label: 'High', color: 'bg-red-100 text-red-800' }
};

const CATEGORIES = [
  'Work',
  'Personal',
  'Shopping',
  'Health',
  'Education',
  'Home'
];

const TodoList = () => {
  const [todos, setTodos] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortDirection, setSortDirection] = useState('asc');
  const [editingTodo, setEditingTodo] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // New todo form state
  const [todoForm, setTodoForm] = useState({
    text: '',
    description: '',
    dueDate: '',
    priority: 'LOW',
    category: 'Work',
    subtasks: []
  });

  // Temporary subtask state
  const [newSubtask, setNewSubtask] = useState('');

  // Fetch todos from Firestore
  useEffect(() => {
    const q = query(collection(db, 'todos'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const todosData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTodos(todosData);
    });

    return () => unsubscribe();
  }, []);

  const addTodo = async (e) => {
    e.preventDefault();
    if (!todoForm.text.trim()) return;

    const newTodoItem = {
      text: todoForm.text.trim(),
      description: todoForm.description,
      completed: false,
      createdAt: new Date().toISOString(),
      dueDate: todoForm.dueDate,
      priority: todoForm.priority,
      category: todoForm.category,
      subtasks: todoForm.subtasks.map(subtask => ({
        id: Date.now() + Math.random(),
        text: subtask,
        completed: false
      }))
    };

    try {
      await addDoc(collection(db, 'todos'), newTodoItem);
      setTodoForm({
        text: '',
        description: '',
        dueDate: '',
        priority: 'LOW',
        category: 'Work',
        subtasks: []
      });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  };

  const addSubtask = () => {
    if (!newSubtask.trim()) return;
    setTodoForm({
      ...todoForm,
      subtasks: [...todoForm.subtasks, newSubtask.trim()]
    });
    setNewSubtask('');
  };

  const removeSubtask = (index) => {
    setTodoForm({
      ...todoForm,
      subtasks: todoForm.subtasks.filter((_, i) => i !== index)
    });
  };

  const toggleTodo = async (id) => {
    const todoRef = doc(db, 'todos', id);
    const todoToUpdate = todos.find(todo => todo.id === id);
    try {
      await updateDoc(todoRef, {
        completed: !todoToUpdate.completed
      });
    } catch (error) {
      console.error('Error toggling todo:', error);
    }
  };

  const toggleSubtask = async (todoId, subtaskId) => {
    const todoRef = doc(db, 'todos', todoId);
    const todoToUpdate = todos.find(todo => todo.id === todoId);
    const updatedSubtasks = todoToUpdate.subtasks.map(subtask =>
      subtask.id === subtaskId
        ? { ...subtask, completed: !subtask.completed }
        : subtask
    );

    try {
      await updateDoc(todoRef, {
        subtasks: updatedSubtasks
      });
    } catch (error) {
      console.error('Error toggling subtask:', error);
    }
  };

  const deleteTodo = async (id) => {
    try {
      await deleteDoc(doc(db, 'todos', id));
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  const filteredAndSortedTodos = () => {
    let filtered = todos.filter(todo => {
      const matchesSearch = todo.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        todo.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'all' || 
        (filterStatus === 'completed' ? todo.completed : !todo.completed);
      const matchesPriority = filterPriority === 'all' || todo.priority === filterPriority;
      const matchesCategory = filterCategory === 'all' || todo.category === filterCategory;

      return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
    });

    return filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.dueDate) - new Date(b.dueDate);
          break;
        case 'priority':
          const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
          comparison = priorityOrder[b.priority] - priorityOrder[a.priority];
          break;
        case 'alphabetical':
          comparison = a.text.localeCompare(b.text);
          break;
        default:
          comparison = 0;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  };

  const renderTodoForm = () => (
    <form onSubmit={addTodo} className="mb-6 p-4 bg-white rounded-lg shadow">
      <div className="space-y-4">
        <div>
          <input
            type="text"
            value={todoForm.text}
            onChange={(e) => setTodoForm({ ...todoForm, text: e.target.value })}
            placeholder="Task title..."
            className="w-full p-2 border rounded-lg"
          />
        </div>
        
        <div>
          <textarea
            value={todoForm.description}
            onChange={(e) => setTodoForm({ ...todoForm, description: e.target.value })}
            placeholder="Description..."
            className="w-full p-2 border rounded-lg"
            rows="3"
          />
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="date"
              value={todoForm.dueDate}
              onChange={(e) => setTodoForm({ ...todoForm, dueDate: e.target.value })}
              className="w-full p-2 border rounded-lg"
            />
          </div>

          <div className="flex-1">
            <select
              value={todoForm.priority}
              onChange={(e) => setTodoForm({ ...todoForm, priority: e.target.value })}
              className="w-full p-2 border rounded-lg"
            >
              {Object.entries(PRIORITY_LEVELS).map(([key, { label }]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <select
              value={todoForm.category}
              onChange={(e) => setTodoForm({ ...todoForm, category: e.target.value })}
              className="w-full p-2 border rounded-lg"
            >
              {CATEGORIES.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newSubtask}
              onChange={(e) => setNewSubtask(e.target.value)}
              placeholder="Add subtask..."
              className="flex-1 p-2 border rounded-lg"
            />
            <button
              type="button"
              onClick={addSubtask}
              className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-2">
            {todoForm.subtasks.map((subtask, index) => (
              <div key={index} className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                <span className="flex-1">{subtask}</span>
                <button
                  type="button"
                  onClick={() => removeSubtask(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={() => setShowAddForm(false)}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2"
          >
            <PlusCircle className="w-5 h-5" />
            Add Task
          </button>
        </div>
      </div>
    </form>
  );

  const renderFilters = () => (
    <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search tasks..."
          className="w-full pl-10 p-2 border rounded-lg"
        />
      </div>

      <select
        value={filterStatus}
        onChange={(e) => setFilterStatus(e.target.value)}
        className="p-2 border rounded-lg"
      >
        <option value="all">All Status</option>
        <option value="completed">Completed</option>
        <option value="active">Active</option>
      </select>

      <select
        value={filterPriority}
        onChange={(e) => setFilterPriority(e.target.value)}
        className="p-2 border rounded-lg"
      >
        <option value="all">All Priorities</option>
        {Object.entries(PRIORITY_LEVELS).map(([key, { label }]) => (
          <option key={key} value={key}>{label}</option>
        ))}
      </select>

      <select
        value={filterCategory}
        onChange={(e) => setFilterCategory(e.target.value)}
        className="p-2 border rounded-lg"
      >
        <option value="all">All Categories</option>
        {CATEGORIES.map(category => (
          <option key={category} value={category}>{category}</option>
        ))}
      </select>
    </div>
  );

  const renderSortControls = () => (
    <div className="mb-4 flex items-center gap-4">
      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
        className="p-2 border rounded-lg"
      >
        <option value="date">Sort by Date</option>
        <option value="priority">Sort by Priority</option>
        <option value="alphabetical">Sort Alphabetically</option>
      </select>

      <button
        onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
        className="p-2 border rounded-lg flex items-center gap-2"
      >
        {sortDirection === 'asc' ? (
          <ChevronUp className="w-5 h-5" />
        ) : (
          <ChevronDown className="w-5 h-5" />
        )}
      </button>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Todo List</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2"
        >
          <PlusCircle className="w-5 h-5" />
          New Task
        </button>
      </div>

      {showAddForm && renderTodoForm()}
      {renderFilters()}
      {renderSortControls()}

      <div className="space-y-3">
        {filteredAndSortedTodos().map(todo => (
          <div
            key={todo.id}
            className="bg-white rounded-lg shadow"
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleTodo(todo.id)}
                    className="text-gray-500 hover:text-blue-500"
                  >
                    {todo.completed ? (
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    ) : (
                      <Circle className="w-6 h-6" />
                    )}
                  </button>
                  <span className={`text-lg ${todo.completed ? 'line-through text-gray-500' : ''}`}>
                    {todo.text}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-sm ${PRIORITY_LEVELS[todo.priority].color}`}>
                    {PRIORITY_LEVELS[todo.priority].label}
                  </span>
                  <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">
                    {todo.category}
                  </span><button
                    onClick={() => deleteTodo(todo.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {todo.description && (
                <p className="text-gray-600 mb-2 ml-9">{todo.description}</p>
              )}

              {todo.dueDate && (
                <div className="flex items-center gap-2 text-gray-500 mb-2 ml-9">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(todo.dueDate).toLocaleDateString()}</span>
                </div>
              )}

              {todo.subtasks && todo.subtasks.length > 0 && (
                <div className="ml-9 mt-3 space-y-2">
                  {todo.subtasks.map(subtask => (
                    <div
                      key={subtask.id}
                      className="flex items-center gap-2 bg-gray-50 p-2 rounded"
                    >
                      <button
                        onClick={() => toggleSubtask(todo.id, subtask.id)}
                        className="text-gray-500 hover:text-blue-500"
                      >
                        {subtask.completed ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <Circle className="w-4 h-4" />
                        )}
                      </button>
                      <span className={`flex-1 ${subtask.completed ? 'line-through text-gray-500' : ''}`}>
                        {subtask.text}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TodoList;