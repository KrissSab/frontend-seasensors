const countLeaveArea = (
  position: number[],
  waterSpeed: number[],
  thrusterSpeed: number[]
): string => {
  const maxPosition = 10000;
  const epsilon = 1e-10;

  if (
    position.length !== 3 ||
    waterSpeed.length !== 3 ||
    thrusterSpeed.length !== 3
  ) {
    return "Invalid input data";
  }

  const axisSpeed = position.map((_, i) => waterSpeed[i] + thrusterSpeed[i]);

  let minPositiveTime = Infinity;

  for (let i = 0; i < 3; i++) {
    const distanceToPositiveBoundary = maxPosition - position[i];
    const distanceToNegativeBoundary = -maxPosition - position[i];

    if (distanceToPositiveBoundary <= 0 || distanceToNegativeBoundary >= 0) {
      return "0.00";
    }

    if (Math.abs(axisSpeed[i]) > epsilon) {
      const timeToPositiveBoundary = distanceToPositiveBoundary / axisSpeed[i];
      const timeToNegativeBoundary = distanceToNegativeBoundary / axisSpeed[i];

      const timeToReachBoundary = Math.min(
        timeToPositiveBoundary > 0 ? timeToPositiveBoundary : Infinity,
        timeToNegativeBoundary > 0 ? timeToNegativeBoundary : Infinity
      );

      if (timeToReachBoundary > 0 && timeToReachBoundary < minPositiveTime) {
        minPositiveTime = timeToReachBoundary;
      }
    }
  }

  return minPositiveTime === Infinity ? "Never" : minPositiveTime.toFixed(2);
};

export { countLeaveArea };
