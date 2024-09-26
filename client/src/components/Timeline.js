// src/components/Timeline.js
import React from "react";
import coupleImage1 from "../img/couple-1.jpg";
import coupleImage2 from "../img/couple-2.jpg";
import coupleImage3 from "../img/couple-3.jpg";
import coupleImage4 from "../img/couple-4.jpg";

const Timeline = () => {
  return (
    <div id="fh5co-couple-story">
      <div className="container">
        <div className="row justify-content-center align-items-center">
          <div className="col-md-8 col-md-offset-2 text-center fh5co-heading animate-box">
            <span>We Love Each Other</span>
            <h2>Our Story</h2>
            <p>Our journey together has been one of faith, love, and adventure. From meeting at church, to countless dates, and finally the proposal, every step has brought us closer and strengthened our bond. Now, we look forward to the next chapter of our lives as we prepare to become husband and wife.</p>
          </div>
        </div>
        <div className="row">
          <div className="col-md-12 col-md-offset-0">
            <ul className="timeline animate-box">
              {/* First timeline event */}
              <li className="animate-box">
                <div className="timeline-badge" style={{ backgroundImage: `url(${coupleImage1})` }}></div>
                <div className="timeline-panel">
                  <div className="timeline-heading">
                    <h3 className="timeline-title">God's Plan</h3>
                    <span className="date">Our Early Years</span>
                  </div>
                  <div className="timeline-body">
                    <p>
                      Christina grew up in New Jersey but was born in San Antonio, TX. Her love for Jesus grew through serving at Victory Chapel in children’s and youth ministries, as well as playing in the worship team.
                    </p>
                    <p>
                      Anthony, born and raised in San Antonio, actively served at First Assembly of God, participating in the youth worship team throughout his middle and high school years.
                    </p>
                    <p>
                      Despite growing up in different places, their shared faith and love for ministry brought them together.
                    </p>
                  </div>
                </div>
              </li>

              {/* Second timeline event */}
              <li className="animate-box timeline-inverted">
                <div className="timeline-badge" style={{ backgroundImage: `url(${coupleImage2})` }}></div>
                <div className="timeline-panel">
                  <div className="timeline-heading">
                    <h3 className="timeline-title">A New Beginning</h3>
                    <span className="date">August 2022 - March 2023</span>
                  </div>
                  <div className="timeline-body">
                    <p>
                      In August 2022, Anthony experienced a life-changing moment when he was baptized, finding a new sense of freedom in his faith. That same month, Christina made the big move to officially settle in San Antonio, Texas.
                    </p>
                    <p>
                      The following year, in 2023, both Anthony and Christina crossed paths at the First Assembly of God church. A connection was instantly formed, and Anthony soon asked Christina to meet him for coffee. This small step led to their first official date at Jazz Texas on March 25, 2023, marking the beginning of their beautiful journey together.
                    </p>
                  </div>
                </div>
              </li>

              {/* Third timeline event */}
              <li className="animate-box">
                <div className="timeline-badge" style={{ backgroundImage: `url(${coupleImage3})` }}></div>
                <div className="timeline-panel">
                  <div className="timeline-heading">
                    <h3 className="timeline-title">A Special Good Friday</h3>
                    <span className="date">April 7, 2023</span>
                  </div>
                  <div className="timeline-body">
                    <p>
                      On Good Friday of 2023, Anthony took a big step and asked Christina to officially be his girlfriend. Christina happily accepted, and this moment marked the start of an even deeper relationship.
                    </p>
                    <p>
                      Over the following months, they spent time with each other’s families, enjoyed countless dates, and along the way, shared many memories together. Through these experiences, they continued to grow closer and learned more about one another, building a solid foundation for their future together.
                    </p>
                  </div>
                </div>
              </li>

              {/* Fourth timeline event - The Proposal */}
              <li className="animate-box timeline-inverted">
                <div className="timeline-badge" style={{ backgroundImage: `url(${coupleImage4})` }}></div>
                <div className="timeline-panel">
                  <div className="timeline-heading">
                    <h3 className="timeline-title">The Proposal</h3>
                    <span className="date">August 31, 2024</span>
                  </div>
                  <div className="timeline-body">
                    <p>
                      On a warm evening in San Antonio, surrounded by friends and family, Anthony surprised Christina with a proposal at the amphitheater. The couple walked together as a trumpet played their special song, marking the beginning of their next chapter.
                    </p>
                    <p>
                      It was a magical moment where Anthony’s plan to ask Christina to marry him unfolded perfectly, filled with joy and love.
                    </p>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timeline;
