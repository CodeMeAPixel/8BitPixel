/**
 * Math utilities for 8BitGE
 * Common math functions used in game development
 */

import { Vector2D } from '../types';

/**
 * Generate a random number between min and max (inclusive)
 */
export function random(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/**
 * Generate a random integer between min and max (inclusive)
 */
export function randomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Linear interpolation between two numbers
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}

/**
 * Map a value from one range to another
 */
export function map(value: number, inMin: number, inMax: number, outMin: number, outMax: number): number {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

/**
 * Convert degrees to radians
 */
export function degToRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Convert radians to degrees
 */
export function radToDeg(radians: number): number {
  return radians * (180 / Math.PI);
}

/**
 * Calculate the distance between two points
 */
export function distance(p1: Vector2D, p2: Vector2D): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate the squared distance between two points (faster than distance)
 */
export function distanceSquared(p1: Vector2D, p2: Vector2D): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return dx * dx + dy * dy;
}

/**
 * Calculate the angle between two points in radians
 */
export function angle(p1: Vector2D, p2: Vector2D): number {
  return Math.atan2(p2.y - p1.y, p2.x - p1.x);
}

/**
 * Calculate the angle between two points in degrees
 */
export function angleDeg(p1: Vector2D, p2: Vector2D): number {
  return radToDeg(angle(p1, p2));
}

/**
 * Calculate the velocity vector from an angle and speed
 */
export function velocityFromAngle(angleRadians: number, speed: number): Vector2D {
  return {
    x: Math.cos(angleRadians) * speed,
    y: Math.sin(angleRadians) * speed
  };
}

/**
 * Create a vector from a polar coordinate (angle in radians and magnitude)
 */
export function vectorFromPolar(angleRadians: number, magnitude: number): Vector2D {
  return {
    x: Math.cos(angleRadians) * magnitude,
    y: Math.sin(angleRadians) * magnitude
  };
}

/**
 * Calculate the magnitude (length) of a vector
 */
export function magnitude(vector: Vector2D): number {
  return Math.sqrt(vector.x * vector.x + vector.y * vector.y);
}

/**
 * Normalize a vector to have a magnitude of 1
 */
export function normalize(vector: Vector2D): Vector2D {
  const mag = magnitude(vector);
  if (mag === 0) return { x: 0, y: 0 };
  
  return {
    x: vector.x / mag,
    y: vector.y / mag
  };
}

/**
 * Scale a vector by a scalar value
 */
export function scale(vector: Vector2D, scalar: number): Vector2D {
  return {
    x: vector.x * scalar,
    y: vector.y * scalar
  };
}

/**
 * Add two vectors
 */
export function add(v1: Vector2D, v2: Vector2D): Vector2D {
  return {
    x: v1.x + v2.x,
    y: v1.y + v2.y
  };
}

/**
 * Subtract v2 from v1
 */
export function subtract(v1: Vector2D, v2: Vector2D): Vector2D {
  return {
    x: v1.x - v2.x,
    y: v1.y - v2.y
  };
}

/**
 * Calculate the dot product of two vectors
 */
export function dot(v1: Vector2D, v2: Vector2D): number {
  return v1.x * v2.x + v1.y * v2.y;
}

/**
 * Reflect a vector off a surface with normal vector n
 */
export function reflect(vector: Vector2D, normal: Vector2D): Vector2D {
  const normalizedNormal = normalize(normal);
  const dotProduct = dot(vector, normalizedNormal) * 2;
  
  return {
    x: vector.x - normalizedNormal.x * dotProduct,
    y: vector.y - normalizedNormal.y * dotProduct
  };
}

/**
 * Limit a vector's magnitude to a maximum value
 */
export function limit(vector: Vector2D, max: number): Vector2D {
  const mag = magnitude(vector);
  if (mag > max) {
    return scale(normalize(vector), max);
  }
  return { ...vector };
}

/**
 * Linear interpolation between two vectors
 */
export function lerpVectors(v1: Vector2D, v2: Vector2D, t: number): Vector2D {
  return {
    x: lerp(v1.x, v2.x, t),
    y: lerp(v1.y, v2.y, t)
  };
}

/**
 * Get a random point within a circle
 */
export function randomPointInCircle(center: Vector2D, radius: number): Vector2D {
  const angle = random(0, Math.PI * 2);
  const r = radius * Math.sqrt(Math.random()); // Account for distribution
  
  return {
    x: center.x + r * Math.cos(angle),
    y: center.y + r * Math.sin(angle)
  };
}

/**
 * Get a random point on a circle
 */
export function randomPointOnCircle(center: Vector2D, radius: number): Vector2D {
  const angle = random(0, Math.PI * 2);
  
  return {
    x: center.x + radius * Math.cos(angle),
    y: center.y + radius * Math.sin(angle)
  };
}

/**
 * Ease in-out function (sigmoid curve)
 */
export function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

/**
 * Ease in (accelerating) function (quadratic)
 */
export function easeIn(t: number): number {
  return t * t;
}

/**
 * Ease out (decelerating) function (quadratic)
 */
export function easeOut(t: number): number {
  return t * (2 - t);
}

/**
 * Check if a point is inside a rectangle
 */
export function pointInRect(
  point: Vector2D, 
  rectX: number, 
  rectY: number, 
  rectWidth: number, 
  rectHeight: number
): boolean {
  return (
    point.x >= rectX &&
    point.x <= rectX + rectWidth &&
    point.y >= rectY &&
    point.y <= rectY + rectHeight
  );
}

/**
 * Check if a point is inside a circle
 */
export function pointInCircle(
  point: Vector2D, 
  center: Vector2D, 
  radius: number
): boolean {
  return distanceSquared(point, center) <= radius * radius;
}

/**
 * Get the nearest point on a line segment to a point
 */
export function nearestPointOnLineSegment(
  point: Vector2D, 
  lineStart: Vector2D, 
  lineEnd: Vector2D
): Vector2D {
  const lineVector = subtract(lineEnd, lineStart);
  const pointVector = subtract(point, lineStart);
  
  const lineLengthSquared = dot(lineVector, lineVector);
  if (lineLengthSquared === 0) return lineStart; // Line segment is a point
  
  // Get projection scalar
  const t = Math.max(0, Math.min(1, dot(pointVector, lineVector) / lineLengthSquared));
  
  // Calculate nearest point
  return {
    x: lineStart.x + t * lineVector.x,
    y: lineStart.y + t * lineVector.y
  };
}

/**
 * Smoothly interpolate between values (damping)
 */
export function smoothDamp(
  current: number, 
  target: number, 
  currentVelocity: { value: number }, 
  smoothTime: number, 
  deltaTime: number, 
  maxSpeed = Infinity
): number {
  smoothTime = Math.max(0.0001, smoothTime);
  const omega = 2 / smoothTime;
  
  const x = omega * deltaTime;
  const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
  
  let change = current - target;
  const originalTo = target;
  
  // Clamp max speed
  const maxChange = maxSpeed * smoothTime;
  change = clamp(change, -maxChange, maxChange);
  target = current - change;
  
  const temp = (currentVelocity.value + omega * change) * deltaTime;
  currentVelocity.value = (currentVelocity.value - omega * temp) * exp;
  
  let output = target + (change + temp) * exp;
  
  // Prevent overshooting
  if (originalTo - current > 0 === output > originalTo) {
    output = originalTo;
    currentVelocity.value = (output - originalTo) / deltaTime;
  }
  
  return output;
}