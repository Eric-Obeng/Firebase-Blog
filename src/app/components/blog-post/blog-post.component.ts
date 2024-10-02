import { Component, OnInit, OnDestroy } from '@angular/core';
import { PostService } from '../../services/post/post.service';
import { CommentService } from '../../services/comment/comment.service';
import { AuthService } from '../../services/auth/auth.service';
import { Post } from '../../model/post';
import { Comment } from '../../model/comment';
import { catchError, forkJoin, of, Subscription, tap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ProfileComponent } from '../profile/profile.component';
import { CreatePostComponent } from '../modal/create-post/create-post.component';
import { CreateCommentComponent } from '../modal/create-comment/create-comment.component';

@Component({
  selector: 'app-blog-post',
  standalone: true,
  imports: [
    CommonModule,
    ProfileComponent,
    CreatePostComponent,
    CreateCommentComponent,
  ],
  templateUrl: './blog-post.component.html',
  styleUrls: ['./blog-post.component.scss'],
})
export class BlogPostComponent implements OnInit, OnDestroy {
  posts: Post[] = [];
  comments: { [postId: string]: Comment[] } = {};
  showComments: { [postId: string]: boolean } = {};
  showPostForm: boolean = false;
  showCommentForm: { [postId: string]: boolean } = {};
  currentPostId: string | null = null;
  currentUserId: string | undefined = undefined;

  private subscription: Subscription = new Subscription();

  constructor(
    private postService: PostService,
    private commentService: CommentService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadPostsAndComments();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private loadCurrentUser(): void {
    this.authService.getCurrentUser().subscribe((user) => {
      this.currentUserId = user?.uid;
    });
  }
  private loadPostsAndComments(): void {
    this.subscription.add(
      this.postService.getPosts().subscribe({
        next: (posts) => {
          this.posts = posts;
          console.log('Posts loaded:', this.posts);
          this.loadCommentsForPosts(posts);
        },
        error: (err) => {
          console.error('Error fetching posts:', err);
        },
      })
    );
  }

  private loadCommentsForPosts(posts: Post[]): void {
    if (posts.length === 0) {
      console.log('No posts found, skipping comments loading.');
      return;
    }

    console.log(`Loading comments for ${posts.length} posts`);

    const commentObservables = posts.map((post) => {
      console.log(`Creating observable for post ID: ${post.id}`);
      return this.commentService.getComments(post.id!).pipe(
        tap((comments) => {
          console.log(`Fetched comments for post ID ${post.id}:`, comments);
          this.comments[post.id!] = comments;
        }),
        catchError((error) => {
          console.error(`Error fetching comments for post ${post.id}:`, error);
          return of([]);
        })
      );
    });

    this.subscription.add(
      forkJoin(commentObservables).subscribe({
        next: (commentsArray) => {
          console.log('Received comments array:', commentsArray);
          posts.forEach((post, index) => {
            this.comments[post.id!] = commentsArray[index] || [];
            console.log(
              `Comments for post ${post.id}:`,
              this.comments[post.id!]
            );
          });
          console.log('All comments loaded:', this.comments);
        },
        error: (err) => {
          console.error('Error fetching comments:', err);
        },
      })
    );
  }

  // Toggle comments visibility for a specific post
  onShowComment(postId: string): void {
    this.showComments[postId] = !this.showComments[postId];
  }

  onShowCommentForm(postId: string) {
    this.currentPostId = postId;
    this.showCommentForm[postId] = !this.showCommentForm[postId];
  }

  onShowPostForm(postId: string) {
    this.currentPostId = postId;
    this.showPostForm = !this.showPostForm;
  }

  onClosePostForm(): void {
    this.showPostForm = false;
    this.currentPostId = null;
  }

  onCloseCommentForm(postId:string) {
    this.showCommentForm[postId] = false;
    this.currentPostId = null;
  }

  onDeletePost(postId: string) {
    if (confirm('Are you sure you want to delete this post?')) {
      this.postService
        .deletePost(postId)
        .then(() => {
          this.posts = this.posts.filter((post) => post.id !== postId);
          console.log('Post deleted successfully!');
        })
        .catch((error) => {
          console.error('Error deleting post:', error);
        });
    }
  }
}
