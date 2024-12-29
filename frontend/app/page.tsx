'use client';
import React, { useState } from 'react';
import ImageSelector from '../components/ImageSelector';
import Downloader from '../components/Downloader';

export default function Home() {

  const [user, setUser] = useState('');
  const [name, setName] = useState('');

  const handleClick = () => {
    setUser(name);
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  }

  return (
    <main className="min-h-screen bg-gray-100 py-8">
      {user === '' ? (
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-center mb-8">Identify yourself.</h1>
          <label>
            Name: <input onChange={(e) => handleChange(e)} name="user" />
          </label>
          <button onClick={() => handleClick()} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Log in</button>
        </div>
      ) : (
        <div className="container mx-auto px-4">
          <Downloader />
          <h1 className="text-3xl font-bold text-center mb-8">Image Selection Tool</h1>
          <ImageSelector user={user}/>
        </div>
      )}

    </main>
  );
}