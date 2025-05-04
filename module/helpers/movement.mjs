export function getLastWaypointGroup(waypoints) {
    const waypointGroup = []
    const waypointsCount = waypoints.length - 1
    for (let i = waypointsCount; i >= 0; i--) {
        // if is first waypoint, or was intermediate step
        if (i === waypointsCount || waypoints[i].intermediate) {
            waypointGroup.push(waypoints[i])
        } else { // else break
            break;
        };
    }

    return waypointGroup
}

export function sumWaypoints(waypoints) {
    const groupDistance = waypoints.reduce((acc, w) => {
        acc += w.cost
        return acc
    }, 0)
    return getApCost(groupDistance)
}

export function getApCost(distance) {
    const gridDistance = game.scenes.active.grid.distance
    const normalApCost = distance / gridDistance

    if (normalApCost < 6) return normalApCost

    const sprintSpeed = gridDistance * 10

    const sprintsCount = Math.max(Math.round(distance / sprintSpeed), 1)
    const remainingDistance = Math.max(distance - (sprintSpeed * sprintsCount), 0)

    const cost = (sprintsCount * gridDistance) + (remainingDistance / gridDistance)

    return cost
}
