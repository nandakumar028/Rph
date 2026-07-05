import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-100 py-4 mt-auto">
      <div className="container mx-auto text-center">
        © {new Date().getFullYear()} Royal Powerhouse. All rights reserved.
      </div>
    </footer>
  );
}
