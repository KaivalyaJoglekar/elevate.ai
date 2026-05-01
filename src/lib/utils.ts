// ==========================================
// Utilities
// ==========================================

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind classes safely
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a file size in bytes to human-readable
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

/**
 * Categorize skills by domain (frontend inference)
 */
const SKILL_CATEGORIES: Record<string, string[]> = {
  "Programming": ["Python", "Java", "C++", "C#", "C", "Go", "Rust", "Kotlin", "Swift", "Scala", "Ruby", "PHP", "Perl", "R", "MATLAB", "Haskell", "Julia", "Dart", "Lua", "Shell", "Bash", "PowerShell"],
  "Frontend": ["React", "Angular", "Vue", "Svelte", "Next.js", "Nuxt", "HTML", "CSS", "JavaScript", "TypeScript", "Tailwind", "Bootstrap", "SASS", "LESS", "jQuery", "Redux", "Zustand", "Webpack", "Vite", "Remix", "Gatsby"],
  "Backend": ["Node.js", "Express", "Django", "Flask", "FastAPI", "Spring", "Spring Boot", "ASP.NET", "Rails", "Laravel", "Gin", "Fiber", "NestJS", "GraphQL", "REST", "gRPC", "Microservices"],
  "Database": ["SQL", "MySQL", "PostgreSQL", "MongoDB", "Redis", "DynamoDB", "Cassandra", "Elasticsearch", "Firebase", "Supabase", "SQLite", "Oracle", "Neo4j"],
  "AI / ML": ["Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "Keras", "Scikit-learn", "NLP", "Computer Vision", "LLM", "Transformers", "Neural Networks", "Data Science", "Pandas", "NumPy", "OpenAI", "Hugging Face", "Generative AI", "RAG", "LangChain"],
  "Cloud / DevOps": ["AWS", "Azure", "GCP", "Docker", "Kubernetes", "Terraform", "CI/CD", "Jenkins", "GitHub Actions", "Linux", "Nginx", "Apache", "Serverless", "Lambda", "CloudFormation", "Ansible", "Prometheus", "Grafana"],
  "Tools": ["Git", "GitHub", "GitLab", "Jira", "Confluence", "Figma", "Postman", "VS Code", "IntelliJ", "Notion", "Slack", "Trello", "Vercel", "Netlify", "Heroku", "Railway"],
  "Soft Skills": ["Leadership", "Communication", "Teamwork", "Problem Solving", "Critical Thinking", "Time Management", "Agile", "Scrum", "Project Management", "Mentoring", "Presentation", "Collaboration", "Adaptability"],
};

export function categorizeSkill(skillName: string): string {
  const normalized = skillName.toLowerCase().trim();
  for (const [category, skills] of Object.entries(SKILL_CATEGORIES)) {
    if (skills.some((s) => normalized.includes(s.toLowerCase()) || s.toLowerCase().includes(normalized))) {
      return category;
    }
  }
  return "Other";
}

export function groupSkillsByCategory(skills: { name: string }[]): Record<string, { name: string }[]> {
  const groups: Record<string, { name: string }[]> = {};
  for (const skill of skills) {
    const category = categorizeSkill(skill.name);
    if (!groups[category]) groups[category] = [];
    groups[category].push(skill);
  }
  return groups;
}
