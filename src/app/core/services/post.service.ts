import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Post } from '../models/post.model';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PostService {
  private baseUrl = 'https://vistagram-backend-n63j.onrender.com/api';
  private currentUserId = 'user123'; // Simulate current user
  
  posts = signal<Post[]>([]);
  selectedPost = signal<Post | null>(null);

  constructor(private http: HttpClient) {}

  async loadPosts() {
    try {
      const posts = await firstValueFrom(
        this.http.get<Post[]>(`${this.baseUrl}/posts`)
      );
      
      // Check which posts are liked by current user
      for (const post of posts) {
        const isLiked = await firstValueFrom(
          this.http.get<boolean>(`${this.baseUrl}/posts/${post.id}/liked?userId=${this.currentUserId}`)
        );
        post.likedByMe = isLiked;
      }
      
      this.posts.set(posts);
    } catch (error) {
      console.error('Error loading posts:', error);
    }
  }

  async fetchById(id: string): Promise<Post | null> {
    try {
      const post = await firstValueFrom(
        this.http.get<Post>(`${this.baseUrl}/posts/${id}`)
      );
      
      // Check if liked by current user
      const isLiked = await firstValueFrom(
        this.http.get<boolean>(`${this.baseUrl}/posts/${id}/liked?userId=${this.currentUserId}`)
      );
      post.likedByMe = isLiked;
      
      this.selectedPost.set(post);
      return post;
    } catch (error) {
      console.error('Error fetching post by ID:', error);
      return null;
    }
  }

  async createPost(username: string, caption: string, imageFile: File): Promise<Post> {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('caption', caption);
    if (imageFile) {
      formData.append('image', imageFile);
    }

    const newPost = await firstValueFrom(
      this.http.post<Post>(`${this.baseUrl}/posts`, formData)
    );
    
    // Add to the beginning of posts array
    this.posts.update(posts => [newPost, ...posts]);
    return newPost;
  }

  async toggleLike(postId: string) {
    try {
      const updatedPost = await firstValueFrom(
        this.http.post<Post>(`${this.baseUrl}/posts/${postId}/like?userId=${this.currentUserId}`, {})
      );

      // Update the local posts array
      this.posts.update(posts => 
        posts.map(p => {
          if (p.id === postId) {
            return {
              ...updatedPost,
              likedByMe: updatedPost.likedByUsers?.includes(this.currentUserId) || false
            };
          }
          return p;
        })
      );
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  }

  async sharePost(postId: string) {
    try {
      const updatedPost = await firstValueFrom(
        this.http.post<Post>(`${this.baseUrl}/posts/${postId}/share`, {})
      );

      // Update the local posts array
      this.posts.update(posts => 
        posts.map(p => p.id === postId ? updatedPost : p)
      );
    } catch (error) {
      console.error('Error sharing post:', error);
    }
  }

  getPostById(id: string): Post | undefined {
    return this.posts().find(p => p.id === id);
  }

  clearSelectedPost() {
    this.selectedPost.set(null);
  }

  async refreshPost(id: string) {
    try {
      const updatedPost = await this.fetchById(id);
      if (updatedPost) {
        this.posts.update(posts =>
          posts.map(p => p.id === id ? updatedPost : p)
        );
      }
    } catch (error) {
      console.error('Error refreshing post:', error);
    }
  }
}