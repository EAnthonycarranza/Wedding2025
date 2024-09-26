import React from 'react';

function Testimonial() {
  return (
    <div id="fh5co-testimonial">
      <div className="container">
        <div className="row">
          <div className="row animate-box">
            <div className="col-md-8 col-md-offset-2 text-center fh5co-heading">
              <span>Best Wishes</span>
              <h2>Friends Wishes</h2>
            </div>
          </div>
          <div className="row">
            <div className="col-md-12 animate-box">
              <div className="wrap-testimony">
                <div className="owl-carousel-fullwidth">
                  <div className="item">
                    <div className="testimony-slide active text-center">
                      <figure>
                        <img src="/images/couple-1.jpg" alt="user" />
                      </figure>
                      <span>John Doe, via <a href="#" className="twitter">Twitter</a></span>
                      <blockquote>
                        <p>"Far far away, behind the word mountains, far from the countries Vokalia and Consonantia."</p>
                      </blockquote>
                    </div>
                  </div>
                  {/* Add more testimonials here */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Testimonial;
