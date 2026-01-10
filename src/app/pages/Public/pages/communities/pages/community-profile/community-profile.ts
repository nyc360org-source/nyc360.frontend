import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common'; 
import { ActivatedRoute, RouterLink } from '@angular/router';
import { environment } from '../../../../../../environments/environment';
import { AuthService } from '../../../../../Authentication/Service/auth';
import { CommunityRequestsComponent } from '../community-requests/community-requests';
import { CommunityProfileService } from '../../services/community-profile';
import { CommunityDetails, CommunityMember, Post } from '../../models/community-profile';

// Enum Matching Backend
export enum CommunityRole {
  Owner = 1,
  Moderator = 2,
  Member = 3
}

@Component({
  selector: 'app-community-profile',
  standalone: true,
  imports: [CommonModule, CommunityRequestsComponent , RouterLink],
  templateUrl: './community-profile.html',
  styleUrls: ['./community-profile.scss']
})
export class CommunityProfileComponent implements OnInit {
  
  private route = inject(ActivatedRoute);
  private profileService = inject(CommunityProfileService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);
  private location = inject(Location); 
  protected readonly environment = environment;

  // Data
  community: CommunityDetails | null = null;
  posts: Post[] = [];
  members: CommunityMember[] = [];
  
  // Roles & Permissions
  ownerId: number = 0;
  memberRole: number | null = null; // 1=Owner, 2=Mod, 3=Member, null=Not Joined
  
  // UI State
  activeTab: string = 'discussion';
  isLoading = false;
  isMembersLoading = false;
  isJoinLoading = false; 
  shareSuccess = false; 

  // Getters for Logic
  get isJoined(): boolean {
    // If role exists and is valid (1, 2, or 3)
    return !!this.memberRole && this.memberRole > 0;
  }

  get isOwner(): boolean {
    return this.memberRole === CommunityRole.Owner;
  }

  get isAdminOrOwner(): boolean {
    return this.memberRole === CommunityRole.Owner || this.memberRole === CommunityRole.Moderator;
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug');
      if (slug) this.loadData(slug);
    });
  }

  loadData(slug: string) {
    this.isLoading = true;
    this.profileService.getCommunityBySlug(slug).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.isSuccess && res.data) {
          this.community = res.data.community;
          this.ownerId = res.data.ownerId;
          
          // API returns numerical role
          this.memberRole = res.data.memberRole ? Number(res.data.memberRole) : null;

          if (res.data.posts && Array.isArray(res.data.posts.data)) {
            this.posts = res.data.posts.data;
          } else {
            this.posts = [];
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

  loadMembers() {
    if (!this.community) return;
    this.activeTab = 'members';
    this.isMembersLoading = true;
    this.profileService.getCommunityMembers(this.community.id).subscribe({
      next: (res) => {
        this.isMembersLoading = false;
        if (res.isSuccess && Array.isArray(res.data)) {
          this.members = res.data;
        }
        this.cdr.detectChanges();
      }
    });
  }

  // --- Actions ---

  onJoinCommunity() {
    if (!this.community || this.isJoined) return;
    
    this.isJoinLoading = true;
    this.profileService.joinCommunity(this.community.id).subscribe({
      next: (res) => {
        this.isJoinLoading = false;
        if (res.isSuccess) {
          this.memberRole = CommunityRole.Member; // Default role
          if (this.community) this.community.memberCount++;
        }
        this.cdr.detectChanges();
      },
      error: () => this.isJoinLoading = false
    });
  }

  onLeaveCommunity() {
    if (!this.community || !confirm('Are you sure you want to leave this community?')) return;

    this.isJoinLoading = true;
    this.profileService.leaveCommunity(this.community.id).subscribe({
      next: (res) => {
        this.isJoinLoading = false;
        if (res.isSuccess) {
          this.memberRole = null; // Reset role
          if (this.community) this.community.memberCount--;
        }
        this.cdr.detectChanges();
      },
      error: () => this.isJoinLoading = false
    });
  }

  onRemoveMember(memberId: number) {
    if (!this.community || !confirm('Are you sure you want to remove this member?')) return;

    this.profileService.removeMember(this.community.id, memberId).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.members = this.members.filter(m => m.userId !== memberId);
        }
      }
    });
  }

  // --- Professional Share Function ---
  onShare() {
    const url = window.location.href;
    const title = this.community?.name || 'Join this Community on NYC360';
    const text = this.community?.description || 'Check out this amazing community!';

    // 1. Try Native Share (Mobile)
    if (navigator.share) {
      navigator.share({
        title: title,
        text: text,
        url: url
      }).catch(err => console.log('Error sharing', err));
    } else {
      // 2. Fallback: Copy to Clipboard (Desktop)
      this.copyToClipboard(url);
    }
  }

  private copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      this.shareSuccess = true;
      this.cdr.detectChanges();
      setTimeout(() => {
        this.shareSuccess = false;
        this.cdr.detectChanges();
      }, 2000); 
    });
  }

  // --- Helpers ---
  resolveCommunityImage(url?: string): string {
    if (!url) return 'assets/images/placeholder-cover.jpg';
    if (url.includes('http')) return url;
    return `${environment.apiBaseUrl2}/communities/${url}`;
  }

  resolvePostImage(url?: string): string {
    if (!url) return '';
    if (url.includes('http')) return url;
    return `${environment.apiBaseUrl2}/posts/${url}`;
  }

  resolveUserAvatar(url?: string | null): string {
    if (!url) return 'assets/images/default-avatar.png';
    if (url.includes('http')) return url;
    return `${environment.apiBaseUrl2}/avatars/${url}`; 
  }

  getAuthorName(author: any): string {
    if (!author) return 'NYC360 Member';
    return typeof author === 'string' ? author : author.name;
  }
}