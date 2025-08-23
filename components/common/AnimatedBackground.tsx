
import React from 'react';

const AnimatedBackground: React.FC = () => {
    return (
        <div className="background-glow fixed top-0 left-0 w-full h-full -z-10 pointer-events-none overflow-hidden">
            <div className="orb orb1 opacity-30"></div>
            <div className="orb orb2 opacity-40"></div>
            <div className="orb orb3 opacity-20"></div>
        </div>
    );
};

export default AnimatedBackground;