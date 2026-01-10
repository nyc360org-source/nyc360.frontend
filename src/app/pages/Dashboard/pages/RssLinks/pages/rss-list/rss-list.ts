import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { environment } from '../../../../../../environments/environment';
import { RssService } from '../../services/rss';
import { RssSource } from '../../models/rss';
import { CATEGORY_LIST } from '../../../../../models/category-list';
// 🔥 Import the shared category list

@Component({
  selector: 'app-rss-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './rss-list.html',
  styleUrls: ['./rss-list.scss']
})
export class RssListComponent implements OnInit {
  
  // Make environment public for HTML
  protected readonly environment = environment;
  
  // Dependencies
  private rssService = inject(RssService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  // State
  rssList: RssSource[] = [];
  isLoading = true;
  errorMessage = '';
  
  // 🔥 Use the shared list
  categories = CATEGORY_LIST;

  ngOnInit() {
    this.loadRssFeeds();
  }

  loadRssFeeds() {
    this.isLoading = true;
    this.errorMessage = '';

    this.rssService.getAllRssSources().subscribe({
      next: (res) => {
        console.log('RSS Response:', res);

        if (res.isSuccess) {
          this.rssList = res.data || [];
        } else {
          this.errorMessage = res.error?.message || 'Failed to load RSS feeds.';
        }
        
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Network Error.';
        console.error(err);
        this.cdr.detectChanges();
      }
    });
  }

  // Helper to get Category Name from ID
  getCategoryName(id: number): string {
    const cat = this.categories.find(c => c.id === id);
    return cat ? cat.name : 'Unknown';
  }

  onDelete(id: number) {
    if(confirm('Are you sure you want to delete this source?')) {
      this.isLoading = true;
      this.rssService.deleteRssSource(id).subscribe({
        next: () => {
          this.loadRssFeeds(); // Reload list
        },
        error: () => {
          alert('Failed to delete.');
          this.isLoading = false;
        }
      });
    }
  }

  onEdit(item: RssSource) {
    this.router.navigate(['/admin/rss/edit'], { state: { data: item } }); 
  }
}