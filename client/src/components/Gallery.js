import React from "react";
import galleryImage1 from "../img/gallery-1.jpg";
import galleryImage2 from "../img/gallery-2.jpg";
import galleryImage3 from "../img/gallery-3.jpg";
import galleryImage4 from "../img/gallery-4.jpg";
import galleryImage5 from "../img/gallery-5.jpg";
import galleryImage6 from "../img/gallery-6.jpg";
import galleryImage7 from "../img/gallery-7.jpg";
import galleryImage8 from "../img/gallery-8.jpg";

const Gallery = () => {
  const galleryItems = [
    { img: galleryImage1, photos: 14, title: "Two Glas of Juice" },
    { img: galleryImage2, photos: 30, title: "Timer starts now!" },
    { img: galleryImage3, photos: 90, title: "Beautiful sunset" },
    { img: galleryImage4, photos: 12, title: "Company's Conference Room" },
    { img: galleryImage5, photos: 50, title: "Useful baskets" },
    { img: galleryImage6, photos: 45, title: "Skater man in the road" },
    { img: galleryImage7, photos: 35, title: "Two Glas of Juice" },
    { img: galleryImage8, photos: 90, title: "Timer starts now!" },
  ];

  return (
    <div id="fh5co-gallery">
      <div className="container">
        <div className="row">
          <div className="col-md-8 offset-md-2 text-center fh5co-heading animate-box">
            <span>Our Memories</span>
            <h2>Wedding Gallery</h2>
            <p>Far far away, behind the word mountains, far from the countries Vokalia and Consonantia, there live the blind texts.</p>
          </div>
        </div>
        <div className="row row-bottom-padded-md">
          <div className="col-md-12">
            <ul id="fh5co-gallery-list">
              {galleryItems.map((item, index) => (
                <li
                  key={index}
                  className="one-third animate-box"
                  style={{ backgroundImage: `url(${item.img})` }}
                  data-animate-effect="fadeIn"
                >
                  <a href={item.img}>
                    <div className="case-studies-summary">
                      <span>{item.photos} Photos</span>
                      <h2>{item.title}</h2>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Gallery;
