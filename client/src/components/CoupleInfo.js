import React from "react";

const CoupleInfo = () => {
  return (
    <div 
      id="fh5co-couple" 
      className="fh5co-section-gray"
      style={{
        backgroundImage: `url("https://theclubatgardenridge.com/wp-content/uploads/2023/01/garden_ridge_watercolor_map.webp")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        position: "relative"
      }}
    >
      <div 
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(255, 255, 255, 0.7)", // Light overlay to keep text readable
          zIndex: 1
        }}
      ></div>
      <div className="container" style={{ position: "relative", zIndex: 2 }}>
        <div className="row justify-content-center">
          <div className="col-md-8 col-md-offset-2 text-center fh5co-heading animate-box">
            <h2 style={{ color: "#323232" }}>Welcome!</h2>
            <h3 style={{ color: "#323232" }}>June 28th, 2025</h3>
            <p style={{ color: "#323232" }}>We invited you to celebrate our wedding!</p>
          </div>
        </div>

        {/* Responsive Couple Wrap */}
        <div
          className="couple-wrap animate-box"
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "40px",
            alignItems: "center",
            flexDirection: window.innerWidth <= 768 ? "column-reverse" : "row", // Responsive layout
          }}
        >
          {/* Groom Section */}
          <div
            className="desc-groom"
            style={{
              flex: 1,
              textAlign: window.innerWidth <= 768 ? "center" : "right",
              paddingRight: window.innerWidth <= 768 ? "0px" : "40px",
            }}
          >
            <img
              src="https://storage.googleapis.com/galleryimageswedding/6.jpg"
              alt="Groom"
              style={{
                width: "200px",
                height: "200px",
                borderRadius: "50%",
                objectFit: "cover",
                marginBottom: "15px",
                border: "4px solid #ddd",
              }}
            />
            <h2
              style={{
                fontFamily: "Sacramento",
                color: "#323232",
              }}
            >
              Eduardo Antonio
            </h2>
            <p>
              Anthony is a kind-hearted man of faith from San Antonio, dedicated
              to his family and music. He's excited to begin this journey with
              Christina.
            </p>
          </div>

          {/* Heart Icon */}
          <div
            className="heart"
            style={{
              flex: 0,
              textAlign: "center",
              margin: "0 20px",
              color: "red",
            }}
          >
            <i className="icon-heart2"></i>
          </div>

          {/* Bride Section */}
          <div
            className="desc-bride"
            style={{
              flex: 1,
              textAlign: window.innerWidth <= 768 ? "center" : "left",
              paddingLeft: window.innerWidth <= 768 ? "0px" : "40px",
            }}
          >
            <img
              src="https://storage.googleapis.com/galleryimageswedding/9.jpg"
              alt="Bride"
              style={{
                width: "200px",
                height: "200px",
                borderRadius: "50%",
                objectFit: "cover",
                objectPosition: "center 80%",
                marginBottom: "15px",
                border: "4px solid #ddd",
              }}
            />

            <h2
              style={{
                fontFamily: "Sacramento",
                color: "#323232",
              }}
            >
              Christina Kyara
            </h2>
            <p>
            Christina, from New Jersey, is a woman of faith with a joyful spirit and a love for family.
            She’s excited as she and Anthony begin the next chapter of their beautiful relationship.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoupleInfo;
