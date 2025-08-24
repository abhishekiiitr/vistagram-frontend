// post-detail.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PostService } from '../../core/services/post.service';
import { PostCard } from '../../shared/components/post-card/post-card';
import { ShareButton } from '../../shared/ui/share-button/share-button';
import { Post } from '../../core/models/post.model';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [CommonModule, PostCard],
  templateUrl: './post-detail.html',
  styleUrl: './post-detail.scss'
})
export class PostDetail implements OnInit, OnDestroy {
  id!: string;
  post: Post | null = null;
  isLoading = false;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute, 
    private postService: PostService,
    private router: Router
  ) {}

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id')!;
    this.loadPost();
  }

  ngOnDestroy() {
    this.postService.clearSelectedPost();
  }

  async loadPost() {
    this.isLoading = true;
    this.error = null;
    
    try {
      // First try to find the post in the current posts array
      const cachedPost = this.postService.getPostById(this.id);
      
      if (cachedPost) {
        this.post = cachedPost;
        this.isLoading = false;
      } else {
        // If not found in cache, fetch from API
        const fetchedPost = await this.postService.fetchById(this.id);
        this.post = fetchedPost;
        this.isLoading = false;
      }
    } catch (error) {
      this.error = 'Failed to load post';
      this.isLoading = false;
      console.error('Error loading post:', error);
    }
  }

  goBack() {
    this.router.navigate(['/']);
  }

  async refreshPost() {
    if (this.id) {
      await this.loadPost();
    }
  }
}