import { motion } from 'motion/react';
import { CurriculumTopic } from '../curriculum/curriculumEngine';

interface ProgressMapProps {
  topics: CurriculumTopic[];
  completedTopicIds: Set<string>;
  currentTopicIndex: number;
}

export default function UpperPrimaryProgressMap({ topics, completedTopicIds, currentTopicIndex }: ProgressMapProps) {
  const nodeRadius = 20;

  return (
    <div className="w-full h-48 relative">
      <svg className="w-full h-full" viewBox="0 0 300 150">
        {/* Drawing the path between nodes */}
        <path
          d="M 50 75 L 125 75 L 200 75 L 275 75"
          fill="none"
          stroke="#cbd5e1"
          strokeWidth="4"
          strokeDasharray="8 8"
        />
        
        {/* Drawing nodes */}
        {topics.map((topic, index) => {
          const isCompleted = completedTopicIds.has(topic.id);
          const isCurrent = index === currentTopicIndex;
          const x = 50 + index * 75;
          const y = 75;

          return (
            <g key={topic.id} className="cursor-pointer">
              <motion.circle
                cx={x}
                cy={y}
                r={nodeRadius}
                fill={isCompleted ? '#a78bfa' : isCurrent ? '#f472b6' : '#e2e8f0'}
                stroke={isCompleted ? '#7c3aed' : '#be185d'}
                strokeWidth="2"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              />
              <text
                x={x}
                y={y + nodeRadius + 15}
                textAnchor="middle"
                fontSize="10"
                fontWeight="bold"
                fill="#475569"
              >
                {topic.title.split(' ')[0]}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
