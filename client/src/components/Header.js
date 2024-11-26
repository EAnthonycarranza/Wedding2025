import React from "react";
import Countdown from "react-countdown"; // Import the countdown component
import bgImage from "../img/img_bg_2.jpg"; // Import the background image

const Header = () => {
  // Determine if screen width is greater than or equal to 1350px
  const isWideScreen = window.innerWidth >= 1350;

  // Countdown renderer function
  const countdownRenderer = ({ days, hours, minutes, seconds, completed }) => {
    if (completed) {
      return (
        <h2
          style={{
            fontFamily: "Sacramento",
            fontSize: "3rem",
            color: "#9c0044",
            marginTop: "20px",
          }}
        >
          The Big Day is Here!
        </h2>
      ); // Message displayed when the countdown ends
    } else {
      return (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "20px",
            fontFamily: "Sacramento",
            color: "#fff",
            fontSize: "2.5rem",
            marginTop: "20px",
          }}
        >
          <div>
            <span style={{ display: "block", fontWeight: "bold" }}>{days}</span>
            <span style={{ fontSize: "1.2rem" }}>Days</span>
          </div>
          <div>
            <span style={{ display: "block", fontWeight: "bold" }}>{hours}</span>
            <span style={{ fontSize: "1.2rem" }}>Hours</span>
          </div>
          <div>
            <span style={{ display: "block", fontWeight: "bold" }}>{minutes}</span>
            <span style={{ fontSize: "1.2rem" }}>Minutes</span>
          </div>
          <div>
            <span style={{ display: "block", fontWeight: "bold" }}>{seconds}</span>
            <span style={{ fontSize: "1.2rem" }}>Seconds</span>
          </div>
        </div>
      );
    }
  };

  return (
<header
  id="fh5co-header"
  className="fh5co-cover"
  role="banner"
  style={{
    backgroundImage: `url(${bgImage})`,
    backgroundSize: "cover",
    backgroundPosition: isWideScreen ? "center top" : "center center", // Adjust background position
    position: "relative", // Ensure proper stacking
  }}
  data-stellar-background-ratio="0.5"
>
  <div
    className="overlay"
    style={{
      backgroundColor: "rgba(0, 0, 0, 0.5)", // Ensure transparency
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      zIndex: 1, // Behind text
    }}
  ></div>
  <div
    className="container"
    style={{ position: "relative", zIndex: 2 }} // Text above overlay
  >
    <div className="row">
      <div className="col-md-8 col-md-offset-2 text-center">
        <div className="display-t">
          <div
            className="display-tc animate-box"
            data-animate-effect="fadeIn"
          >
            <h1
              style={{
                fontFamily: "Sacramento",
                fontSize: "4rem",
                color: "#fff",
                marginBottom: "10px",
              }}
            >
              Christina &amp; Anthony
            </h1>
            <h2
              style={{
                fontFamily: "Sacramento",
                fontSize: "2.5rem",
                color: "#fff",
              }}
            >
              We Are Getting Married
            </h2>
            <div className="simply-countdown">
              <Countdown
                date={new Date("2025-06-28T00:00:00")}
                renderer={countdownRenderer}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</header>
  );
};

export default Header;
