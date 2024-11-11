import {
  useFloating,
  offset,
  flip,
  shift,
  arrow,
  type Placement,
  inline,
  autoUpdate,
  VirtualElement,
} from "@floating-ui/react";
import { useEffect, useRef } from "react";

/**
 * Props for useFloatingTooltip hook
 */
interface UseFloatingTooltipProps {
  /** Initial mouse position */
  initialPosition: { x: number; y: number };
  /** Reference to the boundary element for positioning constraints */
  boundaryRef?: React.RefObject<HTMLElement>;
  /** Fallback container reference if boundaryRef is not provided */
  containerRef?: React.RefObject<HTMLElement>;
  /** Buffer distance to keep tooltip away from mouse */
  mouseBuffer?: number;
  /** Distance to offset tooltip from its anchor point */
  offsetDistance?: number;
  /** Whether to pin tooltip relative to container */
  pinToContainer?: boolean;
  /** Preferred placement of tooltip */
  placement?: Placement;
}

/**
 * Hook for creating floating tooltips with smooth positioning and transitions
 *
 * Features:
 * - Automatic positioning within boundaries
 * - Smooth transitions and mouse following
 * - Handles scroll and resize
 * - Supports virtual elements
 */
export const useFloatingTooltip = ({
  initialPosition,
  boundaryRef,
  containerRef,
  mouseBuffer = 16,
  offsetDistance = 12,
  pinToContainer = false,
  placement = "bottom",
}: UseFloatingTooltipProps) => {
  const arrowRef = useRef(null);
  const positionRef = useRef(initialPosition);
  const floatingRef = useRef<HTMLElement | null>(null);

  // Get boundary element from refs
  const boundaryElement = boundaryRef?.current || containerRef?.current;

  /**
   * Create virtual element for positioning
   * This element tracks mouse position and provides positioning context
   */
  const virtualElementRef = useRef<VirtualElement>({
    getBoundingClientRect() {
      return new DOMRect(
        positionRef.current.x - window.scrollX,
        positionRef.current.y - window.scrollY,
        0,
        0
      );
    },
    contextElement: boundaryElement ?? undefined,
  });

  /**
   * Initialize floating UI with positioning middleware
   */
  const {
    x,
    y,
    strategy,
    refs,
    middlewareData: { arrow: { x: arrowX, y: arrowY } = {} },
    update,
  } = useFloating({
    placement,
    strategy: "fixed",
    middleware: [
      offset(offsetDistance),
      inline(),
      flip({
        fallbackAxisSideDirection: "start",
        padding: mouseBuffer,
        boundary: boundaryElement || undefined,
      }),
      shift({
        padding: mouseBuffer,
        boundary: boundaryElement || undefined,
      }),
      arrow({ element: arrowRef }),
    ],
  });

  /**
   * Update position reference and trigger updates
   */
  useEffect(() => {
    positionRef.current = initialPosition;

    // Ensure floating element is initialized
    if (!refs.floating.current) {
      floatingRef.current = refs.floating.current;
      refs.setPositionReference(virtualElementRef.current);
    }

    // Trigger position update
    requestAnimationFrame(update);
  }, [initialPosition.x, initialPosition.y, refs, update]);

  /**
   * Setup auto-update for smooth following
   */
  useEffect(() => {
    if (!refs.floating.current) return;

    // Set initial position
    const x = positionRef.current.x - window.scrollX;
    const y = positionRef.current.y - window.scrollY;
    refs.floating.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;

    // Setup auto-update with cleanup
    return autoUpdate(
      virtualElementRef.current,
      refs.floating.current,
      () => {
        update();
        // Apply position after update
        if (refs.floating.current) {
          const x = positionRef.current.x - window.scrollX;
          const y = positionRef.current.y - window.scrollY;
          refs.floating.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        }
      },
      {
        elementResize: true,
        ancestorResize: true,
        ancestorScroll: true,
      }
    );
  }, [refs.floating, update]);

  return {
    x: Math.round(positionRef.current.x - window.scrollX),
    y: Math.round(positionRef.current.y - window.scrollY),
    strategy,
    refs,
    arrowRef,
    arrowX: Math.round(arrowX ?? 0),
    arrowY: Math.round(arrowY ?? 0),
  };
};
