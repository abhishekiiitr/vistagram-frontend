import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PostService } from '../../../core/services/post.service';

@Component({
  selector: 'app-create-post',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-post.html',
  styleUrls: ['./create-post.scss']
})
export class CreatePost {
 username = '';
  caption = '';
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  isSubmitting = signal(false);

  @Output() postCreated = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  constructor(private postService: PostService) {}

  selectFile() {
    const input = document.getElementById('imageInput') as HTMLInputElement;
    input.click();
  }


  // Modern camera capture using getUserMedia API with modal
  async capturePhoto() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        this.showCameraPreview(stream);
      } catch (error) {
        console.log('Camera access denied or not available, falling back to file input');
        this.fallbackCapture();
      }
    } else {
      this.fallbackCapture();
    }
  }

  private fallbackCapture() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = (event) => this.onFileSelected(event);
    input.click();
  }

  private showCameraPreview(stream: MediaStream) {
    // Create modal for camera preview
    const modal = document.createElement('div');
    modal.className = 'camera-modal';
    modal.innerHTML = `
      <div class="camera-container">
        <video id="cameraVideo" autoplay playsinline></video>
        <canvas id="cameraCanvas" style="display: none;"></canvas>
        <div class="camera-controls">
          <button id="captureBtn" class="capture-btn">📸 Capture</button>
          <button id="cancelBtn" class="cancel-btn">❌ Cancel</button>
        </div>
      </div>
    `;
    // Add styles
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.9);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
    `;
    const container = modal.querySelector('.camera-container') as HTMLElement;
    container.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: center;
      max-width: 90vw;
      max-height: 90vh;
    `;
    const video = modal.querySelector('#cameraVideo') as HTMLVideoElement;
    video.style.cssText = `
      max-width: 100%;
      max-height: 70vh;
      border-radius: 10px;
    `;
    const controls = modal.querySelector('.camera-controls') as HTMLElement;
    controls.style.cssText = `
      display: flex;
      gap: 1rem;
      margin-top: 1rem;
    `;
    const buttons = modal.querySelectorAll('button');
    buttons.forEach(btn => {
      (btn as HTMLElement).style.cssText = `
        padding: 1rem 2rem;
        border: none;
        border-radius: 25px;
        font-size: 1.1rem;
        cursor: pointer;
        font-weight: 600;
      `;
    });
    const captureBtn = modal.querySelector('#captureBtn') as HTMLElement;
    captureBtn.style.background = '#4CAF50';
    captureBtn.style.color = 'white';
    const cancelBtn = modal.querySelector('#cancelBtn') as HTMLElement;
    cancelBtn.style.background = '#f44336';
    cancelBtn.style.color = 'white';
    document.body.appendChild(modal);
    video.srcObject = stream;
    // Handle capture
    captureBtn.onclick = () => {
      const canvas = modal.querySelector('#cameraCanvas') as HTMLCanvasElement;
      const context = canvas.getContext('2d')!;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) {
          // Create a File object from the blob
          const file = new File([blob], 'captured-image.jpg', { type: 'image/jpeg' });
          // Create a fake event object
          const fakeEvent = {
            target: {
              files: [file]
            }
          };
          this.onFileSelected(fakeEvent);
        }
      }, 'image/jpeg', 0.8);
      // Clean up
      stream.getTracks().forEach(track => track.stop());
      document.body.removeChild(modal);
    };
    // Handle cancel
    cancelBtn.onclick = () => {
      stream.getTracks().forEach(track => track.stop());
      document.body.removeChild(modal);
    };
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage() {
    this.selectedFile = null;
    this.previewUrl = null;
  }

  canSubmit(): boolean {
    return this.username.trim() !== '' && 
           this.caption.trim() !== '' && 
           this.selectedFile !== null;
  }

  async submit() {
    if (!this.canSubmit()) return;

    this.isSubmitting.set(true);
    try {
      await this.postService.createPost(
        this.username.trim(),
        this.caption.trim(),
        this.selectedFile!
      );
      
      this.resetForm();
      this.postCreated.emit();
    } catch (error) {
      alert('Error creating post');
      console.error('Error:', error);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  cancel() {
    this.resetForm();
    this.cancelled.emit();
  }

  private resetForm() {
    this.username = '';
    this.caption = '';
    this.selectedFile = null;
    this.previewUrl = null;
  }
}