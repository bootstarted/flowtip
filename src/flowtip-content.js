import React from "react";

export default function({ className, children }) {
  const classNames = `flowtip-content ${className}`;

  return (
    <div className={classNames}>
      {children}
    </div>
  );
};
