import React from 'react';

const ConflictWarning = ({ hasConflict, resourceName, startTime, endTime }) => {
  if (!hasConflict) return null;

  return (
    <div className="conflict-warning">
      <span className="warning-icon">⚠️</span>
      <div className="warning-message">
        <strong>Time Slot Conflict!</strong>
        <p>
          {resourceName} is already booked from {new Date(startTime).toLocaleString()} 
          to {new Date(endTime).toLocaleString()}
        </p>
      </div>
    </div>
  );
};

export default ConflictWarning;