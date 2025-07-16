import React from "react";
const AIInsights = ({ insights }) => {

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-100 shadow-xl rounded-lg p-8 border border-indigo-200 transition-shadow duration-300 hover:shadow-2xl">
      <h3 className="text-3xl font-semibold text-indigo-800 flex items-center gap-3 mb-6 border-b pb-4 border-indigo-300">
        <span role="img" aria-label="lightbulb" className="text-indigo-600">💡</span>
        AI Financial Insights
      </h3>
      <div className="text-gray-800 text-lg leading-relaxed whitespace-pre-line">
        {insights ? (
          <p>{insights}</p>
        ) : (
          <div className="flex items-center justify-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
            <span className="ml-3 text-gray-600">Generating AI insights...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIInsights;