import timelineItems from "./timelineItems";

/**
 * Takes an array of items and assigns them to lanes based on start/end dates.
 * @returns an array of arrays containing items.
 */
export function assignLanes(items) {
  const sortedItems = items.sort((a, b) =>
      new Date(a.start) - new Date(b.start)
  );
  const lanes = [];

  function assignItemToLane(item) {
      for (const lane of lanes) {
          if (new Date(lane[lane.length - 1].end) < new Date(item.start)) {
              lane.push(item);
              return;
          }
      }
      lanes.push([item]);
  }

  for (const item of sortedItems) {
      assignItemToLane({
        ...item,
        ...getItemWidthAndPositionInsideLane(item, lanes),
      });
  }
  return lanes;
}

export function assignLanesToTimeline(items) {
    const lanes = assignLanes(items);
    const timeline = lanes.map((lane) => {
        return {
            start: lane[0].start,
            end: lane[lane.length - 1].end,
        };
    });
    return timeline;
}

// Each lane should have a 1024px width
// Each lane should have a 100px height
// Each lane should have a 10px margin between them
// The timeline should have a 10px margin between the lanes
// The timeline should have a 10px margin between the start and end of the timeline

export function getItemWidthAndPositionInsideLane(item, lanes) {
    const lane = lanes.find((lane) => {
        return new Date(lane[0].start) <= new Date(item.start) && new Date(lane[lane.length - 1].end) >= new Date(item.end);
    });
    const laneIndex = lanes.indexOf(lane);
    const laneWidth = 1024;
    const laneMargin = 10;
    const itemWidth = (laneWidth - (laneMargin * (lanes.length - 1))) / lanes.length;
    const itemPosition = (itemWidth + laneMargin) * laneIndex;
    return {
        width: itemWidth,
        position: itemPosition,
    };
}

