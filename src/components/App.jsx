import React from 'react';
import Timeline from './Timeline';
import timelineItems from '../timelineItems';
import { assignLanes } from '../assignLanes';

function App() {
  return (
    <div style={{ maxWidth: '100%', padding: '20px' }}>
      <h2>Timeline Visualization {"\u2728"}</h2>
      <h3>{timelineItems.length} timeline items in {assignLanes(timelineItems).length} lanes</h3>
      <div style={{ width: '100%', marginTop: '20px' }}>
        <Timeline timelineItems={timelineItems} />
      </div>
    </div>
  );
}

export default App; 