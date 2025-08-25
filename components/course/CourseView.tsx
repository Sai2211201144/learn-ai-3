

import React from 'react';
import CourseViewRedesigned from './CourseViewRedesigned';

interface CourseViewProps {
    onBack: () => void;
}

const CourseView: React.FC<CourseViewProps> = ({ onBack }) => {
    return <CourseViewRedesigned onBack={onBack} />;
};

export default CourseView;