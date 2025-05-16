import React, { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [newDeadline, setNewDeadline] = useState('');
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingDeadline, setEditingDeadline] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');

  // Fetch tasks from backend
  const fetchTasks = async () => {
    try {
      const res = await axios.get('http://localhost:5000/tasks');
      setTasks(res.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Add new task
  const addTask = async () => {
    if (!newTitle.trim()) return;
    try {
      await axios.post('http://localhost:5000/tasks', {
        title: newTitle,
        deadline: newDeadline || null,
      });
      setNewTitle('');
      setNewDeadline('');
      fetchTasks();
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  // Toggle task completion
  const toggleComplete = async (task) => {
    try {
      await axios.put(`http://localhost:5000/tasks/${task._id}`, {
        completed: !task.completed,
      });
      fetchTasks();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  // Delete task
  const deleteTask = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/tasks/${id}`);
      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  // Start editing a task
  const startEditing = (task) => {
    setEditingTaskId(task._id);
    setEditingTitle(task.title);
    setEditingDeadline(task.deadline ? task.deadline.slice(0, 10) : '');
  };

  // Save edited task
  const saveEdit = async (taskId) => {
    try {
      await axios.put(`http://localhost:5000/tasks/${taskId}`, {
        title: editingTitle,
        deadline: editingDeadline || null,
      });
      setEditingTaskId(null);
      fetchTasks();
    } catch (error) {
      console.error('Error saving task edits:', error);
    }
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingTaskId(null);
  };

  // Clear all completed tasks
  const clearCompletedTasks = async () => {
    try {
      await axios.delete('http://localhost:5000/tasks/clear/completed');
      fetchTasks();
    } catch (error) {
      console.error('Error clearing completed tasks:', error);
    }
  };

  // Calculate upcoming tasks for notifications
  const upcomingTasks = tasks.filter((task) => {
    if (!task.deadline || task.completed) return false;
    const deadlineDate = new Date(task.deadline);
    const now = new Date();
    const diffDays = (deadlineDate - now) / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= 2;
  });

  // Filter tasks according to filter state
  const filteredTasks = tasks.filter((task) => {
    const now = new Date();
    const deadlineDate = task.deadline ? new Date(task.deadline) : null;
    switch (filter) {
      case 'completed':
        return task.completed;
      case 'pending':
        return !task.completed;
      case 'overdue':
        return deadlineDate && !task.completed && deadlineDate < now;
      default:
        return true;
    }
  });

  // Sort filtered tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'deadline') {
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline) - new Date(b.deadline);
    } else {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });

  // Helper: check if task is overdue
  const isOverdue = (task) => {
    if (!task.deadline) return false;
    const deadlineDate = new Date(task.deadline);
    const now = new Date();
    return !task.completed && deadlineDate < now;
  };

  return (
    <div
      style={{
        maxWidth: 700,
        margin: 'auto',
        padding: 20,
        backgroundImage:`url("/bhole.jpg")`,
        backgroundSize: 'cover',
        minHeight: '100vh',
        color: '#222',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <h1 style={{ color: '#fff', textShadow: '1px 1px 2px #000' }}>Task Manager</h1>

      {/* Upcoming deadlines notification */}
      {upcomingTasks.length > 0 && (
        <div
          style={{
            backgroundColor: '#fff3cd',
            color: '#856404',
            border: '1px solid #ffeeba',
            borderRadius: 6,
            padding: 10,
            marginBottom: 20,
            boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
          }}
        >
          <strong>Upcoming Deadlines:</strong>
          <ul>
            {upcomingTasks.map((task) => (
              <li key={task._id}>
                {task.title} - Due {new Date(task.deadline).toLocaleDateString()}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Add new task */}
      <div style={{ marginBottom: 20, display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <input
          style={{ flex: 2, padding: 10, borderRadius: 5, border: '1px solid #ccc' }}
          type="text"
          placeholder="New task title"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTask()}
        />
        <input
          style={{ flex: 1, padding: 10, borderRadius: 5, border: '1px solid #ccc' }}
          type="date"
          value={newDeadline}
          onChange={(e) => setNewDeadline(e.target.value)}
        />
        <button
          onClick={addTask}
          style={{
            padding: '10px 20px',
            backgroundColor: '#4caf50',
            color: 'white',
            border: 'none',
            borderRadius: 5,
            cursor: 'pointer',
          }}
        >
          Add
        </button>
      </div>

      {/* Filters */}
      <div style={{ marginBottom: 20, display: 'flex', gap: 10 }}>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{ padding: 8, borderRadius: 5, border: '1px solid #ccc' }}
        >
          <option value="all">All Tasks</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="overdue">Overdue</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{ padding: 8, borderRadius: 5, border: '1px solid #ccc' }}
        >
          <option value="createdAt">Sort by Created Date</option>
          <option value="deadline">Sort by Deadline</option>
        </select>

        <button
          onClick={clearCompletedTasks}
          style={{
            padding: '8px 12px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: 5,
            cursor: 'pointer',
          }}
          title="Clear all completed tasks"
        >
          Clear Completed
        </button>
      </div>

      {/* Task list */}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {sortedTasks.length === 0 && <li>No tasks found.</li>}

        {sortedTasks.map((task) => (
          <li
            key={task._id}
            style={{
              marginBottom: 10,
              padding: 12,
              backgroundColor: isOverdue(task) ? '#f8d7da' : '#f1f1f1',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => toggleComplete(task)}
              style={{ width: 18, height: 18, cursor: 'pointer' }}
            />

            {editingTaskId === task._id ? (
              <>
                <input
                  type="text"
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  style={{
                    flex: 2,
                    padding: 6,
                    borderRadius: 4,
                    border: '1px solid #ccc',
                  }}
                />
                <input
                  type="date"
                  value={editingDeadline}
                  onChange={(e) => setEditingDeadline(e.target.value)}
                  style={{
                    flex: 1,
                    padding: 6,
                    borderRadius: 4,
                    border: '1px solid #ccc',
                  }}
                />
                <button
                  onClick={() => saveEdit(task._id)}
                  style={{
                    padding: '6px 10px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: 4,
                    cursor: 'pointer',
                  }}
                >
                  Save
                </button>
                <button
                  onClick={cancelEdit}
                  style={{
                    padding: '6px 10px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: 4,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <div
                  style={{
                    flex: 2,
                    textDecoration: task.completed ? 'line-through' : 'none',
                    color: task.completed ? '#6c757d' : '#212529',
                    cursor: 'pointer',
                  }}
                  onDoubleClick={() => startEditing(task)}
                  title="Double click to edit"
                >
                  {task.title}
                </div>
                <div
                  style={{
                    flex: 1,
                    color: isOverdue(task) ? '#721c24' : '#495057',
                    fontStyle: task.deadline ? 'normal' : 'italic',
                  }}
                >
                  {task.deadline
                    ? new Date(task.deadline).toLocaleDateString()
                    : 'No deadline'}
                </div>
                <button
                  onClick={() => startEditing(task)}
                  style={{
                    padding: '6px 10px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: 4,
                    cursor: 'pointer',
                  }}
                  title="Edit task"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteTask(task._id)}
                  style={{
                    padding: '6px 10px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: 4,
                    cursor: 'pointer',
                  }}
                  title="Delete task"
                >
                  Delete
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
