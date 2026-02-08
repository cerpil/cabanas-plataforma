import React from 'react';

export const Loading = () => {
  return (
    <div className="flex flex-col items-center justify-center p-12 w-full">
      <div className="w-12 h-12 border-4 border-stone-200 border-t-green-600 rounded-full animate-spin"></div>
      <p className="mt-4 text-stone-500 font-medium animate-pulse">Carregando dados...</p>
    </div>
  );
};
