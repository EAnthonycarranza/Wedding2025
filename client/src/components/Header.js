import React, { useState, useEffect } from "react";
import Countdown from "react-countdown";

const Header = () => {
  // State to track screen width
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Background position logic
  let backgroundPosition = "center 0%"; // Default for large screens
  if (screenWidth <= 768) {
    backgroundPosition = "67% center"; // Move left on small screens
  }

  return (
    <header
      id="fh5co-header"
      className="fh5co-cover header-bg"
      role="banner"
      style={{
        backgroundImage: `url(https://storage.googleapis.com/galleryimageswedding/20-1.jpg)`,
        backgroundSize: "cover",
        backgroundPosition: backgroundPosition, // Responsive background position
        position: "relative",
      }}
      data-stellar-background-ratio="0.5"
    >
      <div
        className="overlay"
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 1,
        }}
      ></div>
      <div className="container" style={{ position: "relative", zIndex: 2 }}>
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
                    renderer={({ days, hours, minutes, seconds, completed }) =>
                      completed ? (
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
                      ) : (
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
                            <span style={{ display: "block", fontWeight: "bold" }}>
                              {days}
                            </span>
                            <span style={{ fontSize: "1.2rem" }}>Days</span>
                          </div>
                          <div>
                            <span style={{ display: "block", fontWeight: "bold" }}>
                              {hours}
                            </span>
                            <span style={{ fontSize: "1.2rem" }}>Hours</span>
                          </div>
                          <div>
                            <span style={{ display: "block", fontWeight: "bold" }}>
                              {minutes}</span>
                            <span style={{ fontSize: "1.2rem" }}>Minutes</span>
                          </div>
                          <div>
                            <span style={{ display: "block", fontWeight: "bold" }}>
                              {seconds}
                            </span>
                            <span style={{ fontSize: "1.2rem" }}>Seconds</span>
                          </div>
                        </div>
                      )
                    }
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
