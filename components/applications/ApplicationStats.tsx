// components/applications/GitHubStats.tsx
import { Star, GitCommit, GitPullRequest } from 'lucide-react';

interface GitHubStatsProps {
  githubData: {
    repositories: Array<{
      name: string;
      description: string;
      stars: number;
      language: string;
    }>;
    contributions: Array<{
      type: string;
      count: number;
      date: string;
    }>;
  };
}

export default function GitHubStats({ githubData }: GitHubStatsProps) {
  const totalStars = githubData.repositories.reduce((sum, repo) => sum + repo.stars, 0);
  const totalCommits = githubData.contributions.filter(c => c.type === 'PushEvent').reduce((sum, c) => sum + c.count, 0);
  const totalPRs = githubData.contributions.filter(c => c.type === 'PullRequestEvent').length;

  const topRepositories = [...githubData.repositories]
    .sort((a, b) => b.stars - a.stars)
    .slice(0, 3);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center text-gray-600 mb-2">
            <Star className="h-4 w-4 mr-1" />
            Total Stars
          </div>
          <div className="text-2xl font-semibold">{totalStars}</div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center text-gray-600 mb-2">
            <GitCommit className="h-4 w-4 mr-1" />
            Total Commits
          </div>
          <div className="text-2xl font-semibold">{totalCommits}</div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center text-gray-600 mb-2">
            <GitPullRequest className="h-4 w-4 mr-1" />
            Pull Requests
          </div>
          <div className="text-2xl font-semibold">{totalPRs}</div>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Top Repositories</h4>
        <div className="space-y-2">
          {topRepositories.map(repo => (
            <div key={repo.name} className="bg-gray-50 p-3 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h5 className="font-medium text-gray-900">{repo.name}</h5>
                  <p className="text-sm text-gray-600 line-clamp-2">{repo.description}</p>
                </div>
                <div className="flex items-center text-yellow-600">
                  <Star className="h-4 w-4 mr-1" />
                  {repo.stars}
                </div>
              </div>
              <div className="mt-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {repo.language}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}