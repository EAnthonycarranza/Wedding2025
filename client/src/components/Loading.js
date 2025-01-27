import React, { useState, useEffect } from 'react';
import { PacmanLoader } from 'react-spinners';
import { AnimateGroup, Animate } from 'react-simple-animate';

const Loading = ({ color = '#000000', size = 50 }) => {
  const [play, setPlay] = useState(true); // Start with play=true
  const text = ['L', 'O', 'A', 'D', 'I', 'N', 'G'];
  const animationDuration = 1.5; // Time for each animation sequence (in seconds)

  useEffect(() => {
    // Calculate the total duration (time for all letters to animate)
    const totalDuration = animationDuration * text.length * 1000;

    // Toggle the play state after all letters have completed their animation
    const interval = setInterval(() => {
      setPlay((prev) => !prev); // Toggle play state
    }, totalDuration / 4); // Reduce the interval for faster toggling

    return () => clearInterval(interval); // Clean up interval on unmount
  }, [text.length, animationDuration]);

  return (
    <div style={styles.loaderContainer}>
      {/* Pacman Loader */}
      <PacmanLoader color={color} loading size={size} />

      {/* Text Animation */}
      <div style={styles.textContainer}>
        <AnimateGroup play={play} duration={animationDuration} iterationCount={1}>
          {text.map((letter, index) => (
            <Animate
              key={letter}
              sequenceIndex={index} // Animates letters in sequence
              start={{ opacity: 0, transform: 'translateY(10px)' }} // Initial state
              end={{ opacity: 1, transform: 'translateY(0)' }} // Final state
            >
              <span style={styles.text}>{letter}</span>
            </Animate>
          ))}
        </AnimateGroup>
      </div>
    </div>
  );
};

const styles = {
  loaderContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '40vh', // Adjusted to 70% of viewport height for less vertical space
    padding: '25px 0', // Reduced vertical padding
    width: '100%',
  },
  textContainer: {
    marginTop: '30px', // Slightly reduced spacing between loader and text
    display: 'flex',
    gap: '8px', // Adds spacing between letters
  },
  text: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#000',
  },
};

export default Loading;