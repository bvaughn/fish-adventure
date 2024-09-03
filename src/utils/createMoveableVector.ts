import { Vector } from "../types";
import { createMoveable } from "./createMoveable";

export type MoveableVector = ReturnType<typeof createMoveableVector>;

export function createMoveableVector({
  friction = 0.15,
  initialLocation = { x: 0, y: 0 },
  initialVelocity = { x: 0, y: 0 },
  maxLocation,
  maxVelocity,
  minLocation = { x: 0, y: 0 },
  minVelocity,
}: {
  friction?: number;
  initialLocation?: Vector;
  initialVelocity?: Vector;
  maxLocation?: Vector;
  maxVelocity?: Vector;
  minLocation?: Vector;
  minVelocity?: Vector;
}) {
  const moveableX = createMoveable({
    friction,
    initialPosition: initialLocation.x,
    initialVelocity: initialVelocity.x,
    maxPosition: maxLocation?.x,
    maxVelocity: maxVelocity?.x,
    minPosition: minLocation.x,
    minVelocity: minVelocity?.x,
  });
  const moveableY = createMoveable({
    friction,
    initialPosition: initialLocation.y,
    initialVelocity: initialVelocity.y,
    maxPosition: maxLocation?.y,
    maxVelocity: maxVelocity?.y,
    minPosition: minLocation.y,
    minVelocity: minVelocity?.y,
  });

  function getAcceleration() {
    return {
      x: moveableX.getAcceleration(),
      y: moveableY.getAcceleration(),
    };
  }

  function getPosition() {
    return {
      x: moveableX.getPosition(),
      y: moveableY.getPosition(),
    };
  }

  function getVelocity() {
    return {
      x: moveableX.getVelocity(),
      y: moveableY.getVelocity(),
    };
  }

  function setAcceleration(value: Vector) {
    moveableX.setAcceleration(value.x);
    moveableY.setAcceleration(value.y);
  }

  function setAccelerationX(value: number) {
    moveableX.setAcceleration(value);
  }

  function setAccelerationY(value: number) {
    moveableY.setAcceleration(value);
  }

  function setPosition(value: Vector) {
    moveableX.setPosition(value.x);
    moveableY.setPosition(value.y);
  }

  function setPositionX(value: number) {
    moveableX.setPosition(value);
  }

  function setPositionY(value: number) {
    moveableY.setPosition(value);
  }

  function setVelocity(value: Vector) {
    moveableX.setVelocity(value.x);
    moveableY.setVelocity(value.y);
  }

  function setVelocityX(value: number) {
    moveableX.setVelocity(value);
  }

  function setVelocityY(value: number) {
    moveableY.setVelocity(value);
  }

  return {
    getAcceleration,
    getPosition,
    getVelocity,
    setAcceleration,
    setAccelerationX,
    setAccelerationY,
    setPosition,
    setPositionX,
    setPositionY,
    setVelocity,
    setVelocityX,
    setVelocityY,
  };
}
