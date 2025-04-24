// File: ButtomNavBar.js
import React, { useState, useEffect, useRef, useMemo } from "react";
import { useSprings, animated, to } from "react-spring";
import { useGesture } from "@use-gesture/react";
import { IconButton, useMediaQuery, useTheme, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import HomeIcon from "@mui/icons-material/Home";
import InfoIcon from "@mui/icons-material/Info";
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import EventIcon from "@mui/icons-material/Event";
import ExploreIcon from "@mui/icons-material/Explore";
import "./ButtonNavBar.css";

// Base menu items
const menuItems = [
  { label: "Home", path: "/home", icon: <HomeIcon /> },
  { label: "About", path: "/about", icon: <InfoIcon /> },
  { label: "Registry", path: "/registry", icon: <CardGiftcardIcon /> },
  { label: "Gallery", path: "/gallery", icon: <PhotoLibraryIcon /> },
  { label: "RSVP", path: "/rsvp", icon: <EventIcon /> },
  { label: "Travel", path: "/tour", icon: <ExploreIcon /> },
];

const ButtomNavBar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [jiggle, setJiggle] = useState(false);
  const [hasRSVP, setHasRSVP] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch RSVP data to determine if user has RSVP
  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("/rsvp", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setHasRSVP(Boolean(data.mongoData && data.mongoData.familyMembers?.length));
      })
      .catch((err) => console.error("Error fetching RSVP status:", err))
      .finally(() => setLoading(false));
  }, []);

  // Filter out RSVP if user has no data
  const items = useMemo(
    () => menuItems.filter((item) => item.label !== "RSVP" || hasRSVP),
    [hasRSVP]
  );
  const numItems = items.length;
  const radius = 80; // radius for menu item expansion in pixels

  // Setup springs for the menu items.
  const [springs, api] = useSprings(numItems, () => ({ x: 0, y: 0, opacity: 0, config: { tension: 300, friction: 20 } }));

  useEffect(() => {
    api.start((index) => {
      const angle = (2 * Math.PI * index) / numItems - Math.PI / 2 + rotation;
      return {
        x: open ? radius * Math.cos(angle) : 0,
        y: open ? radius * Math.sin(angle) : 0,
        opacity: open ? 1 : 0,
      };
    });
  }, [open, rotation, api, numItems]);

  // Gesture binding
  const bind = useGesture(
    {
      onDrag: ({ event, xy: [x, y], memo }) => {
        event.preventDefault();
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const currentAngle = Math.atan2(y - cy, x - cx);
        if (memo === undefined) memo = { initialAngle: currentAngle, startRotation: rotation };
        const angleDelta = currentAngle - memo.initialAngle;
        setRotation(memo.startRotation + angleDelta);
        return memo;
      },
    },
    { drag: { filterTaps: true } }
  );

  // Jiggle effect
  const initialTimeoutRef = useRef();
  const intervalRef = useRef();
  const jiggleTimeoutRef = useRef();
  useEffect(() => {
    if (!open) {
      clearTimeout(initialTimeoutRef.current);
      clearInterval(intervalRef.current);
      clearTimeout(jiggleTimeoutRef.current);
      setJiggle(false);
      return;
    }
    initialTimeoutRef.current = setTimeout(() => {
      setJiggle(true);
      jiggleTimeoutRef.current = setTimeout(() => setJiggle(false), 500);
      intervalRef.current = setInterval(() => {
        setJiggle(true);
        jiggleTimeoutRef.current = setTimeout(() => setJiggle(false), 500);
      }, 3000);
    }, 1000);
    return () => {
      clearTimeout(initialTimeoutRef.current);
      clearInterval(intervalRef.current);
      clearTimeout(jiggleTimeoutRef.current);
    };
  }, [open]);

  if (!isMobile || loading) return null;

  return (
    <div ref={containerRef} className="buttom-nav-container" {...bind()}>
      {springs.map((props, index) => {
        const angle = (2 * Math.PI * index) / numItems - Math.PI / 2 + rotation;
        const angleDeg = (angle * 180) / Math.PI;
        return (
          <animated.div
            key={index}
            style={{
              position: "absolute",
              bottom: 0,
              left: "50%",
              transform: to([props.x, props.y], (x, y) => `translate(-50%, 0) translate(${x}px, ${y}px)`),
              opacity: props.opacity,
              pointerEvents: open ? "auto" : "none",
            }}
          >
            <div className="jiggle-wrapper" style={{ transform: `rotate(${angleDeg + 90}deg)` }}>
              <div className={`jiggle-inner ${jiggle ? "jiggle" : ""}`}> 
                <div style={{ transform: `rotate(-${angleDeg + 90}deg)` }}>
                  <div className="menu-item-container">
                    <div className="icon-bubble">{items[index].label}</div>
                    <IconButton
                      onClick={() => {
                        setOpen(false);
                        navigate(items[index].path);
                      }}
                      sx={{
                        backgroundColor: "#000000",
                        color: "#ffffff",
                        margin: "5px",
                        "&:hover": { backgroundColor: "#333333" },
                      }}
                    >
                      {items[index].icon}
                    </IconButton>
                  </div>
                </div>
              </div>
            </div>
          </animated.div>
        );
      })}
      <div className="central-button">
        <IconButton
          onClick={() => setOpen((prev) => !prev)}
          sx={{
            backgroundColor: "#000000",
            color: "#ffffff",
            "&:hover": { backgroundColor: "#333333" },
          }}
        >
          {open ? <CloseIcon /> : <MenuIcon />}
        </IconButton>
      </div>
    </div>
  );
};

export default ButtomNavBar;