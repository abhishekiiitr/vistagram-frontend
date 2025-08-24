import { Component, OnInit, computed, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PostService } from '../../core/services/post.service';
import { PostCard } from '../../shared/components/post-card/post-card';
import { CreatePost } from '../../shared/components/create-post/create-post';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, PostCard, CreatePost],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit { 
   posts = computed(() => this.postService.posts());
  showCreateModal = signal(false);

  constructor(private postService: PostService) {}

  ngOnInit() {
    this.postService.loadPosts();
  }

  onPostCreated() {
    this.showCreateModal.set(false);
  }

  closeModal(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.showCreateModal.set(false);
    }
  }

  trackByPostId(index: number, post: any): string {
    return post.id;
  }
}