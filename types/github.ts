export interface GithubRepository {
    id: string;
    name: string;
    description: string;
    stars: number;
    forks: number;
    language: string;
  }
  
  export interface GithubContribution {
    type: string;
    repo: string;
    date: string;
    count: number;
  }
  
  export interface IGithubData {
    id: string;
    login: string;
    name: string;
    email: string;
    avatar_url: string;
    bio: string;
    public_repos: number;
    followers: number;
    repositories: GithubRepository[];
    contributions: GithubContribution[];
  }
  