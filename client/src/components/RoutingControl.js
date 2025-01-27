import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";

const RoutingControl = ({ userLocation, destination }) => {
  const map = useMap();
  let routingControl = null;

  useEffect(() => {
    if (!userLocation || !destination) return;

    // Safely remove existing routing control
    if (routingControl) {
      try {
        routingControl.getPlan().setWaypoints([]); // Clear waypoints
        map.removeControl(routingControl); // Remove routing control from the map
        routingControl = null; // Reset routing control to null
      } catch (error) {
        console.error("Error removing previous routing control:", error);
      }
    }

    // Add new routing control
    routingControl = L.Routing.control({
      waypoints: [
        L.latLng(userLocation.lat, userLocation.lng),
        L.latLng(destination.lat, destination.lon),
      ],
      routeWhileDragging: false, // Disable dragging routes
      lineOptions: {
        styles: [{ color: "blue", weight: 6 }], // Blue line for the route
      },
      createMarker: () => null, // Prevent default markers
      show: true, // Show the default route instructions panel
      formatter: new L.Routing.Formatter({
        units: "imperial", // Use imperial units (miles and feet)
        round: true,
        distanceTemplate: "{value} {unit}",
      }),
    }).addTo(map);


    // Enable dragging and resizing of the panel
    const panelElement = document.querySelector(".leaflet-routing-container");
    if (panelElement) {
        panelElement.style.display = "block";
        panelElement.style.position = "absolute";
        panelElement.style.zIndex = "1000";
        panelElement.style.backgroundColor = "white";
        panelElement.style.border = "1px solid #ccc";
        panelElement.style.padding = "10px";
        panelElement.style.boxShadow = "0px 4px 6px rgba(0, 0, 0, 0.1)";
        panelElement.style.cursor = "move";
      
        // Explicitly position it in the top-left corner of the map
        panelElement.style.left = "20px";
        panelElement.style.top = "20px";
      
      }
      

    return () => {
      // Safely remove routing control during cleanup
      if (routingControl) {
        try {
          routingControl.getPlan().setWaypoints([]); // Clear waypoints before removing
          map.removeControl(routingControl); // Remove routing control from the map
          routingControl = null; // Reset routing control to null
        } catch (error) {
          console.error("Error during cleanup:", error);
        }
      }
    };
  }, [map, userLocation, destination]);

  return null;
};

// Helper function to make the panel draggable
function makeDraggable(element) {
  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;

  element.style.cursor = "move";

  const onMouseDown = (e) => {
    isDragging = true;
    offsetX = e.clientX - element.getBoundingClientRect().left;
    offsetY = e.clientY - element.getBoundingClientRect().top;
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  const onMouseMove = (e) => {
    if (!isDragging) return;
    element.style.left = `${e.clientX - offsetX}px`;
    element.style.top = `${e.clientY - offsetY}px`;
  };

  const onMouseUp = () => {
    isDragging = false;
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
  };

  element.addEventListener("mousedown", onMouseDown);
}

// Helper function to make the panel resizable
function makeResizable(element) {
  const resizer = document.createElement("div");
  resizer.style.width = "10px";
  resizer.style.height = "10px";
  resizer.style.background = "gray";
  resizer.style.position = "absolute";
  resizer.style.right = "0";
  resizer.style.bottom = "0";
  resizer.style.cursor = "nwse-resize";
  element.appendChild(resizer);

  resizer.addEventListener("mousedown", (e) => {
    e.preventDefault();

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = parseInt(
      document.defaultView.getComputedStyle(element).width,
      10
    );
    const startHeight = parseInt(
      document.defaultView.getComputedStyle(element).height,
      10
    );

    const onMouseMove = (e) => {
      element.style.width = `${startWidth + e.clientX - startX}px`;
      element.style.height = `${startHeight + e.clientY - startY}px`;
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  });
}

export default RoutingControl;
