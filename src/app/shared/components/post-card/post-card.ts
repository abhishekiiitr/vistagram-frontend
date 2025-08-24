import { Component, Input } from '@angular/core';
import { Post } from '../../../core/models/post.model';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PostService } from '../../../core/services/post.service';

@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './post-card.html',
  styleUrls: ['./post-card.scss']
})
export class PostCard {
   @Input() post!: Post;

  constructor(private postService: PostService) {}

  async toggleLike() {
    await this.postService.toggleLike(this.post.id);
  }

  async sharePost() {
    await this.postService.sharePost(this.post.id);
    const url = `${window.location.origin}/${this.post.id}`;
    // Try to use the Web Share API if available
    if (navigator.share) {
      navigator.share({
  title: `Check out this post by ${this.post.username}`,
        text: this.post.caption,
        url: url,
      }).catch(err => {
        // Fallback to clipboard copy if share fails
        this.copyToClipboard(url);
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      this.copyToClipboard(url);
    }
  }

  private copyToClipboard(url: string) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        this.showShareNotification(`Link copied to clipboard!`);
      }).catch(() => {
        this.fallbackCopyToClipboard(url);
      });
    } else {
      this.fallbackCopyToClipboard(url);
    }
  }

  private fallbackCopyToClipboard(text: string) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      this.showShareNotification('Link copied to clipboard!');
    } catch (err) {
      this.showShareNotification('Unable to copy link');
    }
    document.body.removeChild(textArea);
  }

  private showShareNotification(message: string) {
    // Simple notification - you could replace this with a toast service
    const notification = document.createElement('div');
    notification.className = 'share-notification';
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #333;
      color: white;
      padding: 12px 24px;
      border-radius: 25px;
      z-index: 10000;
      font-size: 14px;
      animation: slideInRight 0.3s ease;
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  getTimeAgo(dateString: string): string {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffMs = now.getTime() - postDate.getTime();
    
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMinutes < 1) return 'now';
    if (diffMinutes < 60) return `${diffMinutes}m`;
    if (diffHours < 24) return `${diffHours}h`;
    return `${diffDays}d`;
  }
}