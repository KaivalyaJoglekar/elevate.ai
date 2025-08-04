import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useTheme } from '../hooks/useTheme';

const LoaderAnimation = ({ theme }: { theme: 'light' | 'dark' }) => {
  return (
    <StyledLoaderWrapper theme={theme}>
      <div className="loader">
        <div className="loader-orbits">
          <div className="loader-orbits__electron" />
          <div className="loader-orbits__electron" />
          <div className="loader-orbits__electron" />
        </div>
      </div>
    </StyledLoaderWrapper>
  );
};

const StyledLoaderWrapper = styled.div<{ theme: 'light' | 'dark' }>`
  .loader {
    --float: 5%;
    --radius: 2rem;
    background: #8B5CF6; 
    border-radius: var(--radius);
    height: var(--radius);
    position: relative;
    width: var(--radius);
  }
  
  .loader::after {
    --light-x: 30%;
    --light-y: 25%;
    --light-radius: 3%;
    background: radial-gradient(circle at var(--light-x) var(--light-y), rgba(255, 255, 255, 1), transparent calc(1 * var(--light-radius))),
      radial-gradient(circle at var(--light-x) var(--light-y), rgba(255, 255, 255, 0.8), transparent calc(2 * var(--light-radius))),
      radial-gradient(circle at var(--light-x) var(--light-y), rgba(255, 255, 255, 0.6), transparent calc(3 * var(--light-radius))),
      radial-gradient(circle at var(--light-x) var(--light-y), rgba(255, 255, 255, 0.4), transparent calc(4 * var(--light-radius))),
      radial-gradient(circle at var(--light-x) var(--light-y), rgba(255, 255, 255, 0.2), transparent calc(5 * var(--light-radius)));
    border-radius: inherit;
    content: "";
    height: 100%;
    left: 0;
    position: absolute;
    top: 0;
    width: 100%;
  }

  .loader-orbits {
    --color-line: ${(props) => (props.theme === 'dark' ? '#fff' : '#4b5563')};
    --color-glow: ${(props) => (props.theme === 'dark' ? '#60A5FA' : '#8B5CF6')};
    --electron-nb: 3;
    --radius: 500%;
    border-radius: var(--radius);
    filter: drop-shadow(0 0 0.3rem var(--color-glow));
    height: var(--radius);
    left: calc(50% - var(--radius) / 2);
    position: absolute;
    top: calc(50% - var(--radius) / 2);
    width: var(--radius);
  }
  
  .loader-orbits__electron {
    --clip-radius: 20%;
    --radius: 100%;
    --ratio: 4;
    border-radius: var(--radius);
    height: calc(var(--radius) / var(--ratio));
    left: calc(50% - var(--radius) / 2);
    position: absolute;
    top: calc(50% - var(--radius) / (var(--ratio) * 2));
    transform: rotateZ(calc(var(--index) * 180deg / var(--electron-nb)));
    width: var(--radius);
    z-index: 100;
  }
  .loader-orbits__electron::before,
  .loader-orbits__electron::after {
    border-radius: inherit;
    box-shadow: inset 0 var(--offset-direction) 0 0.02rem var(--color-line);
    content: "";
    height: 100%;
    left: 0;
    position: absolute;
    top: 0;
    width: 100%;
  }
  .loader-orbits__electron::before { --offset-direction: 0.1rem; }
  .loader-orbits__electron::after { --offset-direction: -0.1rem; }
  .loader-orbits__electron:nth-child(1) { --index: 0; }
  .loader-orbits__electron:nth-child(2) { --index: 1; }
  .loader-orbits__electron:nth-child(3) { --index: 2; }
  .loader {
    animation-name: floatAtom;
    animation-duration: 2s;
    animation-iteration-count: infinite;
    animation-timing-function: linear;
  }
  .loader-orbits__electron {
    animation-name: orbitElectron;
    animation-delay: calc((var(--index) + 1) * 0.5s / var(--electron-nb));
    animation-duration: 0.5s;
    animation-iteration-count: infinite;
    animation-timing-function: linear;
  }
  @keyframes floatAtom {
    0% { transform: translateY(calc(-1 * var(--float))); }
    25% { transform: translateY(calc(-2 * var(--float))); }
    50% { transform: translateY(calc(-1 * var(--float))); }
    75% { transform: translateY(calc(0 * var(--float))); }
    100% { transform: translateY(calc(-1 * var(--float))); }
  }
  @keyframes orbitElectron {
    0% { clip-path: ellipse(calc(2 * var(--clip-radius)) var(--clip-radius) at 50% 0); }
    25% { clip-path: ellipse(calc(2 * var(--clip-radius)) var(--clip-radius) at 0 50%); }
    50% { clip-path: ellipse(calc(2 * var(--clip-radius)) var(--clip-radius) at 50% 100%); }
    75% { clip-path: ellipse(calc(2 * var(--clip-radius)) var(--clip-radius) at 100% 50%); }
    100% { clip-path: ellipse(calc(2 * var(--clip-radius)) var(--clip-radius) at 50% 0); }
  }
`;

interface FullScreenLoaderProps {
  isVisible: boolean;
  message: string;
}

const FullScreenLoader: React.FC<FullScreenLoaderProps> = ({ isVisible, message }) => {
  const { theme } = useTheme();
  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-100/80 dark:bg-black/80 backdrop-blur-md"
    >
      <div className="flex flex-col items-center">
        <LoaderAnimation theme={theme} />
        
        <motion.p
          key={message} // Animate when the message changes
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-gray-600 dark:text-gray-300 text-center max-w-xs mt-16 text-lg"
          style={{ textShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)' }}
        >
          {message}
        </motion.p>
      </div>
    </div>
  );
};

export default FullScreenLoader;