import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import MusicPlayer from '../music/MusicPlayer';

export default function Layout() {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-wrapper">
        <Navbar />
        <main className="content-scrollable">
          <Outlet />
        </main>
      </div>
      <MusicPlayer />
    </div>
  );
}
