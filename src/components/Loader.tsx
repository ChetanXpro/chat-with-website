import React from "react";

const Loader = () => {
  return (
    <div className="flex items-center justify-center flex-col gap-3 h-screen">
      <div className="w-16 h-16 border-t-4 border-blue-500 rounded-full animate-spin"></div>
    </div>
  );
};

export default Loader;
