import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../App';
import Timeline from '../Timeline';
import timelineItems from '../../timelineItems';
import { assignLanes } from '../../assignLanes';

// Mock the dependencies
jest.mock('../Timeline', () => jest.fn(() => <div data-testid="timeline-mock" />));
jest.mock('../../assignLanes', () => ({
  assignLanes: jest.fn().mockReturnValue([
    [{ id: 1, name: 'Task 1', start: '2021-01-10', end: '2021-01-20' }],
    [{ id: 2, name: 'Task 2', start: '2021-01-15', end: '2021-01-25' }]
  ])
}));

describe('App Component', () => {
  it('should render the title', () => {
    render(<App />);
    
    // Check that the title is rendered
    expect(screen.getByText(/Timeline Visualization/i)).toBeInTheDocument();
  });
  
  it('should show the number of timeline items and lanes', () => {
    render(<App />);
    
    // Check if the lane count appears in the document
    expect(screen.getByText(new RegExp(`${timelineItems.length} timeline items`, 'i'))).toBeInTheDocument();
    expect(screen.getByText(/lanes/i)).toBeInTheDocument();
    
    // Verify that assignLanes was called with the timelineItems
    expect(assignLanes).toHaveBeenCalledWith(timelineItems);
  });
  
  it('should render the Timeline component with correct props', () => {
    render(<App />);
    
    // Check that the Timeline component is rendered
    expect(screen.getByTestId('timeline-mock')).toBeInTheDocument();
    
    // Verify Timeline was called with the timelineItems
    expect(Timeline).toHaveBeenCalledWith(
      expect.objectContaining({
        timelineItems
      }),
      expect.anything()
    );
  });
}); 