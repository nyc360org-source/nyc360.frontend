import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../../../environments/environment';
import { CommunityService } from '../../services/community';
import { CommunityPost, CommunitySuggestion } from '../../models/community';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-community',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './community.html',
  styleUrls: ['./community.scss']
})
export class CommunityComponent implements OnInit {

  private communityService = inject(CommunityService);
  private cdr = inject(ChangeDetectorRef);
  protected readonly environment = environment;

  // Data Containers
  suggestions: CommunitySuggestion[] = [];
  posts: CommunityPost[] = [];
  featuredPost: CommunityPost | null = null;

  isLoading = true;

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    this.communityService.getCommunityHome(1, 20).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.isSuccess && res.data) {
          // 1. Communities Cards
          this.suggestions = res.data.suggestions || [];

          // 2. Feed Posts
          const allPosts = res.data.feed?.data || [];
          if (allPosts.length > 0) {
            this.featuredPost = allPosts[0];
            this.posts = allPosts.slice(1);
          }
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // دالة الانضمام
  joinCommunity(comm: CommunitySuggestion) {
    if (comm.isJoined) return; // منع التكرار

    comm.isLoadingJoin = true; // تفعيل اللودينج

    // نمرر comm.id (رقم) للسيرفس
    this.communityService.joinCommunity(comm.id).subscribe({
      next: (res) => {
        comm.isLoadingJoin = false;
        if (res.isSuccess) {
          comm.isJoined = true; // تغيير الحالة لـ Joined
          comm.memberCount++; // زيادة العداد

          alert('You have joined the community successfully!');
        } else {
          console.error('Join Error:', res.error);
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        comm.isLoadingJoin = false;
        console.error('Network Error:', err);
        this.cdr.detectChanges();
      }
    });
  }

  // --- Image Resolvers ---

  resolveCommunityAvatar(url?: string): string {
    if (!url) return 'assets/images/default-group.png';
    if (url.includes('http')) return url;
    return `${environment.apiBaseUrl2}/communities/${url}`;
  }

  resolvePostImage(url?: string): string {
    if (!url || url.trim() === '') return 'assets/images/nyc-city.jpg';

    // تنظيف المسار
    const cleanUrl = url.replace('@local://', '');

    // لو لينك خارجي
    if (cleanUrl.startsWith('http')) return cleanUrl;

    // لو صورة من السيرفر (posts)
    return `${this.environment.apiBaseUrl3}/${cleanUrl}`;
  }
}