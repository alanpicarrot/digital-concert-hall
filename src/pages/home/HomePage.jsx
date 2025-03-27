import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
          數位音樂廳
        </h1>
        <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
          隨時隨地，享受頂級音樂饗宴
        </p>
      </div>

      <div className="mt-12 bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">管理後台入口</h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>
              前往管理後台進行音樂會、票券等管理。
            </p>
          </div>
          <div className="mt-5">
            <Link
              to="/admin/dashboard"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              進入管理後台
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
