import React from 'react'

const Datadropdown = () => {
  return (
    <nav className="bg-black text-white p-4">
      <ul className="flex space-x-6">
        {/* Other nav items */}
        <li className="relative group">
          <span className="cursor-pointer">Data</span>
          {/* Dropdown menu */}
          <div className="absolute left-0 hidden group-hover:block bg-gray-800 mt-2 rounded shadow-lg">
            <a href="#option1" className="block px-4 py-2 hover:bg-gray-700">
              Option 1
            </a>
            <a href="#option2" className="block px-4 py-2 hover:bg-gray-700">
              Option 2
            </a>
            <a href="#option3" className="block px-4 py-2 hover:bg-gray-700">
              Option 3
            </a>
          </div>
        </li>
        {/* Other nav items */}
      </ul>
    </nav>
  )
}

export default Datadropdown
