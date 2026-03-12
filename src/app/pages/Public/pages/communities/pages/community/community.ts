import { Component, OnInit, inject, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../../../environments/environment';
import { CommunityService } from '../../services/community';
import { CommunityPost, CommunitySuggestion } from '../../models/community';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../../../../Authentication/Service/auth';
import { UserInfo } from '../../../../../Authentication/models/user-info';

import { VerificationModalComponent } from '../../../../../../shared/components/verification-modal/verification-modal';
import { buildCommunityD01BadgeOptions, isCommunityLeaderTag } from '../../../../../../shared/utils/community-badge-policy';


@Component({
  selector: 'app-community',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, VerificationModalComponent],
  templateUrl: './community.html',
  styleUrls: ['./community.scss']
})
export class CommunityComponent implements OnInit {

  private authService = inject(AuthService);
  private communityService = inject(CommunityService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);
  protected readonly environment = environment;

  // UI State
  isActivityDropdownOpen = false;
  activeSubMenu: string | null = null;

  // Data Containers
  suggestions: CommunitySuggestion[] = [];
  posts: CommunityPost[] = [];
  featuredPost: CommunityPost | null = null;
  userTags: any[] = []; // Tags for permission check
  communityPublicBadgeTags: any[] = buildCommunityD01BadgeOptions([]);
  currentUserInfo: UserInfo | null = null;
  isVerificationModalOpen = false;
  communitySearchTerm = '';

  get hasCommunityLeaderAccess(): boolean {
    // 1. Check if SuperAdmin
    if (this.authService.hasRole('SuperAdmin')) return true;

    // 2. Check tags in UserInfo (Primary Reactive Source from my-info)
    if (this.currentUserInfo && this.currentUserInfo.tags) {
      return this.currentUserInfo.tags.some((t: any) => isCommunityLeaderTag(t));
    }

    // 3. Fallback to local tags from page response (if my-info is pending)
    return this.userTags.some((t: any) => isCommunityLeaderTag(t));
  }

  openVerificationModal() {
    this.isVerificationModalOpen = true;
    this.isActivityDropdownOpen = false; // Close dropdown
  }

  closeVerificationModal() {
    this.isVerificationModalOpen = false;
  }

  onVerified() {
    // Reload User Info to get the new tag immediately
    this.authService.fetchFullUserInfo().subscribe();
    this.closeVerificationModal();
  }

  isLoading = true;

  ngOnInit() {
    this.loadData();

    // Subscribe to User Info changes to update UI automatically
    this.authService.fullUserInfo$.subscribe((info: UserInfo | null) => {
      this.currentUserInfo = info;
      this.cdr.detectChanges();
    });
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

          // 3. Local Tags (Optional fallback)
          if (res.data.tags) {
            this.userTags = res.data.tags;
          }
          this.communityPublicBadgeTags = buildCommunityD01BadgeOptions(res.data.tags || []);
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onCommunitySearch(): void {
    const search = this.communitySearchTerm.trim();
    this.router.navigate(
      ['/public/discover'],
      { queryParams: search ? { search } : {} }
    );
  }

  get discussionPosts(): CommunityPost[] {
    if (this.posts.length > 0) {
      return this.posts.slice(0, 3);
    }
    return this.featuredPost ? [this.featuredPost] : [];
  }

  get supportCards(): Array<{ post: CommunityPost; label: 'QUESTION' | 'Help' }> {
    const primary = this.posts.slice(3, 5);
    const fallback = this.posts.slice(0, 2);
    const source = (primary.length > 0 ? primary : fallback).slice(0, 2);

    return source.map((post, index) => ({
      post,
      label: this.inferSupportLabel(post, index)
    }));
  }

  private inferSupportLabel(post: CommunityPost, index: number): 'QUESTION' | 'Help' {
    const text = [
      post?.title || '',
      post?.content || '',
      ...(post?.tags || [])
    ].join(' ').toLowerCase();

    if (text.includes('help')) return 'Help';
    if (text.includes('question') || text.includes('?')) return 'QUESTION';

    return index === 0 ? 'QUESTION' : 'Help';
  }

  getPostAuthorName(post: CommunityPost): string {
    if (typeof post?.author === 'string') return post.author;
    return post?.author?.name || 'Community Member';
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

  toggleActivityDropdown(event: Event) {
    event.stopPropagation();
    this.isActivityDropdownOpen = !this.isActivityDropdownOpen;
    if (!this.isActivityDropdownOpen) {
      this.activeSubMenu = null;
    }
  }

  toggleSubMenu(menuName: string, event: Event) {
    event.stopPropagation();
    this.activeSubMenu = this.activeSubMenu === menuName ? null : menuName;
  }

  @HostListener('document:click')
  closeDropdownHandler() {
    this.isActivityDropdownOpen = false;
    this.activeSubMenu = null;
  }
}
