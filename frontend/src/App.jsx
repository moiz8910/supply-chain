import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import MainLayout from './components/MainLayout';
import ExceptionsScreen from './components/ExceptionsScreen';
import NetworkMapScreen from './components/NetworkMapScreen';
import TasksScreen from './components/TasksScreen';
import TaskDetailScreen from './components/TaskDetailScreen';
import OptimizerScreen from './components/OptimizerScreen';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
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
