// Simple frontmatter parser (no Node.js dependencies)
function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { data: {}, content: raw };

  const frontmatter = match[1];
  const content = match[2];
  const data = {};

  for (const line of frontmatter.split('\n')) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    let value = line.slice(colonIdx + 1).trim();
    // Remove surrounding quotes
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    // Parse arrays like ["tag1", "tag2"]
    if (value.startsWith('[') && value.endsWith(']')) {
      try {
        value = JSON.parse(value);
      } catch {
        // keep as string
      }
    }
    data[key] = value;
  }

  return { data, content };
}

// Import all markdown files from content/blog
const blogFiles = import.meta.glob('/src/content/blog/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
});

function parsePosts() {
  const posts = [];

  for (const [path, raw] of Object.entries(blogFiles)) {
    const slug = path.split('/').pop().replace('.md', '');
    const { data, content: body } = parseFrontmatter(raw);

    posts.push({
      slug,
      title: data.title || '',
      date: data.date || '',
      excerpt: data.excerpt || '',
      tags: Array.isArray(data.tags) ? data.tags : [],
      author: data.author || '',
      lang: data.lang || 'en',
      body,
    });
  }

  return posts.sort((a, b) => new Date(b.date) - new Date(a.date));
}

const allPosts = parsePosts();

export function getAllPosts(lang = 'en') {
  return allPosts.filter((post) => post.lang === lang);
}

export function getPostBySlug(slug, lang = 'en') {
  return allPosts.find(
    (post) => post.slug === slug && post.lang === lang
  ) || allPosts.find((post) => post.slug === slug);
}
