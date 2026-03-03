import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import MainLayout from './components/MainLayout';
import ExceptionsScreen from './components/ExceptionsScreen';
import NetworkMapScreen from './components/NetworkMapScreen';
import TasksScreen from './components/TasksScreen';
import TaskDetailScreen from './components/TaskDetailScreen';
import OptimizerScreen from './components/OptimizerScreen';
import LoginScreen from './components/LoginScreen';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/" element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="exceptions" element={<ExceptionsScreen />} />
          <Route path="exceptions/:exceptionId" element={<ExceptionsScreen />} />
          <Route path="map" element={<NetworkMapScreen />} />
          <Route path="tasks" element={<TasksScreen />} />
          <Route path="tasks/:taskId" element={<TaskDetailScreen />} />
          <Route path="optimizer" element={<OptimizerScreen />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
