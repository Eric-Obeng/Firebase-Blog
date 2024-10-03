import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { PostService } from '../../../services/post/post.service';
import { Post } from '../../../model/post';
import { Auth, user } from '@angular/fire/auth';
import { switchMap } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-create-post',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-post.component.html',
  styleUrls: ['./create-post.component.scss'],
})
export class CreatePostComponent implements OnInit {
  @Input() postId?: string;
  postForm!: FormGroup;
  displayName: string | null = '';
  userId: string | null = '';
  isEditMode: boolean = false;
  postToEdit: Post | undefined;
  @Output() closeForm = new EventEmitter<void>();

  constructor(
    private fb: FormBuilder,
    private postService: PostService,
    private auth: Auth
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.setAuthorName();

    if (this.postId) {
      this.isEditMode = true;
      this.loadPostData();
    }
  }

  private initializeForm(): void {
    this.postForm = this.fb.group({
      title: ['', Validators.required],
      content: ['', Validators.required],
      author: [{ value: '', disabled: true }, Validators.required],
    });
  }

  private setAuthorName(): void {
    user(this.auth)
      .pipe(
        switchMap((authUser) => {
          if (authUser) {
            this.displayName = authUser.displayName;
            this.userId = authUser.uid;
            this.postForm.patchValue({
              author: this.displayName,
            });
          }
          return [];
        })
      )
      .subscribe();
  }

  private loadPostData(): void {
    if (!this.postId) return;

    this.postService.getPostById(this.postId).subscribe((post) => {
      if (post && post.authorId === this.userId) {
        this.postToEdit = post;
        this.postForm.patchValue({
          title: post.title,
          content: post.content,
          author: post.author,
        });
        console.log(this.userId);
      } else {
        // Handle unauthorized editing attempt
        console.error('Unauthorized to edit this post.');
      }
    });
  }

  submit(): void {
    if (this.postForm.invalid) return;

    const postData: Post = {
      ...this.postForm.getRawValue(), // Get all form values including disabled fields
      authorId: this.userId!,
      createdAt: this.isEditMode ? this.postToEdit?.createdAt : new Date().toLocaleDateString(),
      updatedAt: new Date().toLocaleDateString(),
    };

    if (this.isEditMode && this.postId) {
      this.postService.updatePost(this.postId, postData).then(() => {
        console.log('Post updated successfully');
      });
      this.closeForm.emit();
    } else {
      this.postService.createPost(postData).then((newPostId) => {
        console.log('Post created with ID:', newPostId);
      });
      this.closeForm.emit();
    }

    this.postForm.reset();
  }
}
