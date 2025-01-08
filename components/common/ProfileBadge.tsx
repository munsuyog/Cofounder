import { Award, Zap } from 'lucide-react';

interface ProfileBadgeProps {
  name: string;
  githubUsername: string;
  avatar: string;
  githubProfileUrl?: string;
}

const ProfileBadge: React.FC<ProfileBadgeProps> = ({ 
  name, 
  githubUsername, 
  avatar, 
  githubProfileUrl 
}) => {
  return (
    <div className="flex items-center space-x-3 bg-gray-100 rounded-full px-3 py-1">
      <img 
        src={avatar} 
        alt={`${name}'s avatar`} 
        className="w-8 h-8 rounded-full border-2 border-white"
      />
      <div className="flex flex-col">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-sm">{name}</span>
          <a 
            href={githubProfileUrl || `https://github.com/${githubUsername}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-gray-700"
          >
            @{githubUsername}
          </a>
        </div>
        <div className="flex items-center space-x-2 text-xs text-gray-600">
          <Award size={14} className="text-yellow-500" />
          <span>Top Contributor</span>
          <Zap size={14} className="text-indigo-500" />
          <span>Active</span>
        </div>
      </div>
    </div>
  );
};

export default ProfileBadge;