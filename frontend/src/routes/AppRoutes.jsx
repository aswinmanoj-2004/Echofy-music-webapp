import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import ProtectedRoute from './ProtectedRoute';

import LandingPage from '../pages/auth/LandingPage';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ArtistLogin from '../pages/auth/ArtistLogin';
import ArtistRegister from '../pages/auth/ArtistRegister';

import Home from '../pages/user/Home';
import Search from '../pages/user/Search';
import ArtistDetails from '../pages/user/ArtistDetails';
import AlbumDetails from '../pages/user/AlbumDetails';
import PlaylistPage from '../pages/user/PlaylistPage';
import FavoritesPage from '../pages/user/FavoritesPage';
import RecentlyPlayedPage from '../pages/user/RecentlyPlayedPage';
import ProfilePage from '../pages/user/ProfilePage';
import SettingsPage from '../pages/user/SettingsPage';

import ArtistDashboard from '../pages/artist/ArtistDashboard';
import UploadSong from '../pages/artist/UploadSong';
import ManageAlbums from '../pages/artist/ManageAlbums';

import SongDetailsPage from '../pages/user/SongDetailsPage';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/landing" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/artist/login" element={<ArtistLogin />} />
      <Route path="/artist/register" element={<ArtistRegister />} />

      {/* Main App Protected Layout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/home" replace />} />
        <Route path="home" element={<Home />} />
        <Route path="search" element={<Search />} />
        <Route path="song/:id" element={<SongDetailsPage />} />
        <Route path="artist/:id" element={<ArtistDetails />} />
        <Route path="album/:id" element={<AlbumDetails />} />
        <Route path="playlists" element={<PlaylistPage />} />
        <Route path="playlist/:id" element={<PlaylistPage />} />
        <Route path="favorites" element={<FavoritesPage />} />
        <Route path="recent" element={<RecentlyPlayedPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="settings" element={<SettingsPage />} />

        {/* Artist Protected Routes */}
        <Route
          path="artist/dashboard"
          element={
            <ProtectedRoute requireArtist={true}>
              <ArtistDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="artist/upload"
          element={
            <ProtectedRoute requireArtist={true}>
              <UploadSong />
            </ProtectedRoute>
          }
        />
        <Route
          path="artist/albums"
          element={
            <ProtectedRoute requireArtist={true}>
              <ManageAlbums />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/landing" replace />} />
    </Routes>
  );
}
