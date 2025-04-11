# Timeline Component

This is a React component to show items on a timeline view.

## What it Does

- Shows timeline items in lanes.
- Tries to fit items in the same lane if they don't overlap.
- Zoom works with buttons and mouse wheel.
- Can drag items to change start/end dates or move the whole thing.
- Double-click item name to edit it.
- Shows tooltips when hovering or dragging.
- Success toasts provide feedback for user actions.

## What Went Well

- **Using Canvas**: Was a good choice, I think. Performance seems okay for drawing the items.
- **Drag and Drop**: Getting the dragging logic for resizing and moving felt like a good achievement.
- **Lane Packing**: The basic packing works to save space.
- **Zooming Out**: The way the timeline extends to show future dates when zooming out is a nice touch.
- **Refactored Utilities**: Breaking timeline utilities into specialized modules improved code organization and maintainability.
- **Visual Feedback**: Added success toasts and visual cues for editing to enhance the user experience.
- **Centralized Controls**: Moved zoom controls to the center of the header for better visibility and access.

## If I Had More Time / Next Steps

- **Code Structure**: `TimelineUtils.js` has been refactored, but could still use more optimization.
- **Styling**: The CSS is basic. Could use CSS Modules or styled-components. Some styles are still inline in the component for speed.
- **Dates**: Would be better to use a library like `date-fns` for date stuff.
- **Testing**: Needs more tests! Especially for dragging weird cases and maybe different screen sizes.
- **Accessibility**: Didn't have time to add keyboard support or check screen readers.
- **Options**: Would be good to add props to change colors, date format, etc.
- **More UX Enhancements**: Would add animations for zoom transitions, keyboard shortcuts, undo/redo functionality, and multi-select options.
- **Mobile Support**: Would implement touch support and responsive design for smaller screens.
- **Context Menu**: Right-click options for quick actions would be useful.
- **Performance Optimizations**: For large datasets, would implement virtualization to render only visible items.

## Design Thoughts

- Looked at some calendar apps for ideas on the interactions.
- Used the `assignLanes.js` helper provided as a starting point.
- Built the basic drawing first, then added zoom, then drag/edit features.
- Used AI to help with some boilerplate, especially for initial canvas drawing logic and autocompletions, but iterated quite a bit on the suggestions to get the final result.
- Kept the UI simple. The dots for dragging are maybe a bit basic but show where to click.
- Added the live tooltip for dragging because it's hard to know the exact date otherwise.
- Some things like tooltip styling ended up inline because it was quicker to get it working under the time limit.
- Added visual feedback through toasts and animation to make the interface feel more responsive and intuitive.
- Went with a centralized control panel design to make zoom functionality more discoverable.

## Testing Ideas (More Time Needed)

- **Disclaimer**: The current unit tests were largely generated with AI assistance and serve as a basic foundation. They would need significant review and expansion for production use.
- Unit test the lane logic and date math.
- Test drag/drop more thoroughly (fast drags, edge cases).
- Maybe visual tests to catch rendering bugs?
- Performance test with lots of items.
- Test touch interactions for mobile users.
- Usability testing to validate UX improvements.

## How to Run

1.  `npm install`
2.  `npm start`

Uses the sample data in `src/timelineItems.js`. 