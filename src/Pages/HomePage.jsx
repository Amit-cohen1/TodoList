import React, { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, deleteDoc, doc, query, where, updateDoc } from 'firebase/firestore';
import { getAuth, signOut } from 'firebase/auth';
import { Link, useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase';
import './HomePage.css';

const TaskCard = ({ header, body, footer }) => {
  return (
    <div className="task-card">
      <p>{header}</p>
      <p>{body}</p>
      {footer}
    </div>
  );
};

const HomePage = () => {
  const [tasks, setTasks] = useState([]);
  const [doneTasks, setDoneTasks] = useState([]);
  const [newTaskHeader, setNewTaskHeader] = useState('');
  const [newTaskBody, setNewTaskBody] = useState('');
  const navigate = useNavigate();

  const fetchTasks = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        const querySnapshot = await query(
          collection(db, 'tasks'),
          where('email', '==', user.email)
        );
        const updatedTasks = [];
        const updatedDoneTasks = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const task = { id: doc.id, ...data };
          if (data.isDone) {
            updatedDoneTasks.push(task);
          } else {
            updatedTasks.push(task);
          }
        });
        setTasks(updatedTasks);
        setDoneTasks(updatedDoneTasks);
      } catch (error) {
        console.error('Error fetching tasks: ', error);
      }
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleTaskHeaderChange = (e) => {
    setNewTaskHeader(e.target.value);
  };

  const handleTaskBodyChange = (e) => {
    setNewTaskBody(e.target.value);
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    if (newTaskHeader.trim() !== '' && newTaskBody.trim() !== '') {
      try {
        const docRef = await addDoc(collection(db, 'tasks'), {
          header: newTaskHeader,
          body: newTaskBody,
          email: auth.currentUser.email,
          isDone: false,
        });
        console.log('Task added with ID: ', docRef.id);
        setNewTaskHeader('');
        setNewTaskBody('');
      } catch (error) {
        console.error('Error adding task: ', error);
      }
    }
  };

  const handleTaskDone = async (taskId) => {
    try {
      await updateDoc(doc(db, 'tasks', taskId), {
        isDone: true,
      });
    } catch (error) {
      console.error('Error marking task as done: ', error);
    }
  };

  const handleTaskDelete = async (taskId, isDone) => {
    try {
      if (isDone) {
        await deleteDoc(doc(db, 'tasks', taskId));
      } else {
        await updateDoc(doc(db, 'tasks', taskId), {
          isDone: true,
        });
        setDoneTasks((prevDoneTasks) =>
          prevDoneTasks.filter((task) => task.id !== taskId)
        );
      }
    } catch (error) {
      console.error('Error deleting task: ', error);
    }
  };

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        navigate('/login');
      })
      .catch((error) => {
        console.error('Error signing out: ', error);
      });
  };

  return (
    <div>
      <button className='logout-btn' onClick={handleLogout}>התנתק</button>
      <div className='container1'>
        <h1>רשימת המשימות של {auth.currentUser && auth.currentUser.displayName}</h1>
        <form onSubmit={handleTaskSubmit}>
          <input
            className='task-input'
            type="text"
            value={newTaskHeader}
            onChange={handleTaskHeaderChange}
            placeholder="כותרת"
          />
          <input
            className='task-input'
            type="text"
            value={newTaskBody}
            onChange={handleTaskBodyChange}
            placeholder="גוף המשימה"
          />
          <p>
            <button className='button-task' type="submit">הוסף</button>
          </p>
        </form>
        <div className="task-container">
          {tasks.map((task) => (
            <div key={task.id}>
              <TaskCard
                header={task.header}
                body={task.body}
                footer={
                  <>
                    <button
                      className='button-task'
                      onClick={() => handleTaskDone(task.id)}
                    >
                      סמן כבוצע
                    </button>
                    <button
                      className='button-task'
                      onClick={() => handleTaskDelete(task.id, false)}
                    >
                      מחק
                    </button>
                  </>
                }
              />
            </div>
          ))}
        </div>
        <h1>משימות שבוצעו</h1>
        <div className="task-container">
          {doneTasks.map((task) => (
            <div key={task.id}>
              <TaskCard
                header={task.header}
                body={task.body}
                footer={
                  <button
                    className='button-task'
                    onClick={() => handleTaskDelete(task.id, true)}
                  >
                    מחק
                  </button>
                }
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
