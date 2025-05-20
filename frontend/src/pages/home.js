import React, { useState, useEffect } from "react";

const Home = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const mockPosts = [
      { id: 1, author: "Lucas", content: "Olá, mundo!", likes: 10 },
      { id: 2, author: "Ana", content: "Estou usando o Zebify!", likes: 5 },
    ];
    setPosts(mockPosts);
  }, []);

  return (
    <div>
      <h1>Bem-vindo ao Zebify!</h1>
      <PostList posts={posts} />
    </div>
  );
};

const PostList = ({ posts }) => (
  <div>
    {posts.map((post) => (
      <Post
        key={post.id}
        author={post.author}
        content={post.content}
        likes={post.likes}
      />
    ))}
  </div>
);

const Post = ({ author, content, likes }) => (
  <div>
    <h2>{author}</h2>
    <p>{content}</p>
    <p>Likes: {likes}</p>
  </div>
);

export default Home;
