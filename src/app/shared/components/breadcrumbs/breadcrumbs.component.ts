import { Component, OnInit, OnDestroy, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { filter, Subscription } from 'rxjs';

/**
 * Breadcrumb model
 */
export interface Breadcrumb {
    label: string;
    url: string;
}

/**
 * ROUTE_MAP: Defines the structure of breadcrumbs based on URL patterns.
 * Captured segments from Regex are used to build ancestor URLs.
 */
const ROUTE_MAP: Array<{
    match: RegExp;
    crumbs: (m: RegExpMatchArray, full: string) => Breadcrumb[];
}> = [
        // Category Pages
        { match: /^\/category\/([^/]+)$/, crumbs: (m, f) => [{ label: 'Category', url: `/public/category/${m[1]}` }] },
        { match: /^\/category\/([^/]+)\/saved/, crumbs: (m, f) => [{ label: 'Category', url: `/public/category/${m[1]}` }, { label: 'My Inquiries', url: f }] },
        { match: /^\/category\/([^/]+)\/dashboard/, crumbs: (m, f) => [{ label: 'Category', url: `/public/category/${m[1]}` }, { label: 'Dashboard', url: f }] },

        // Community
        { match: /^\/communities$/, crumbs: () => [{ label: 'Communities', url: '/public/communities' }] },
        { match: /^\/community\/([^/]+)$/, crumbs: (m, f) => [{ label: 'Communities', url: '/public/communities' }, { label: m[1].replace(/-/g, ' '), url: f }] },
        { match: /^\/my-communities$/, crumbs: () => [{ label: 'Communities', url: '/public/communities' }, { label: 'My Communities', url: '/public/my-communities' }] },

        // Housing
        { match: /^\/housing$/, crumbs: () => [{ label: 'Housing', url: '/public/housing' }] },
        { match: /^\/housing\/feed$/, crumbs: () => [{ label: 'Housing', url: '/public/housing' }, { label: 'Explore', url: '/public/housing/feed' }] },
        { match: /^\/housing\/details\/([^/]+)$/, crumbs: (m, f) => [{ label: 'Housing', url: '/public/housing' }, { label: 'Property Details', url: f }] },

        // Professions / Jobs
        { match: /^\/profession$/, crumbs: () => [{ label: 'Professions', url: '/public/profession' }] },
        { match: /^\/profession\/jobs$/, crumbs: () => [{ label: 'Professions', url: '/public/profession' }, { label: 'Explore Jobs', url: '/public/profession/jobs' }] },
        { match: /^\/job-profile\/([^/]+)$/, crumbs: (m, f) => [{ label: 'Professions', url: '/public/profession' }, { label: 'Job Details', url: f }] },

        // Forums
        { match: /^\/forums\/([^/]+)$/, crumbs: (m, f) => [{ label: 'Forums', url: '/public/forums' }, { label: m[1].replace(/-/g, ' '), url: f }] },

        // Posts & Global Details
        { match: /^\/posts\/details\/([^/]+)$/, crumbs: (m, f) => [{ label: 'Posts', url: '/public/home' }, { label: 'Post Details', url: f }] },
        { match: /^\/post\/([^/]+)$/, crumbs: (m, f) => [{ label: 'Posts', url: '/public/home' }, { label: 'Post Details', url: f }] },

        // Fallbacks
        { match: /^\/home$/, crumbs: () => [] },
        { match: /^\/discover$/, crumbs: () => [{ label: 'Discover', url: '/public/discover' }] },
        { match: /^\/search$/, crumbs: () => [{ label: 'Search', url: '/public/search' }] }
    ];

/**
 * Normalizes context keys (e.g., all urls under 'category/housing' relate to the same context)
 */
function getContextKey(relUrl: string): string {
    const segs = relUrl.replace(/^\//, '').split('/');
    const root = segs[0] || '';

    // If it's a category/housing/etc, identify the section
    if (root === 'category' && segs[1]) return `cat:${segs[1]}`;
    if (root === 'community' && segs[1] && segs[1] !== '') return `community:${segs[1]}`;
    if (root === 'housing') return 'housing';
    if (root === 'profession') return 'profession';
    if (root === 'forums') return 'forums';

    return root;
}

@Component({
    selector: 'app-breadcrumbs',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './breadcrumbs.component.html',
    styleUrls: ['./breadcrumbs.component.css']
})
export class BreadcrumbsComponent implements OnInit, OnDestroy {
    private router = inject(Router);
    private routerSub?: Subscription;

    breadcrumbs: Breadcrumb[] = [];
    isScrolled = false;

    // Tracks navigation history within a specific context
    private history: Breadcrumb[] = [];
    private contextKey: string = '';

    constructor() { }

    @HostListener('window:scroll', [])
    onWindowScroll() {
        this.isScrolled = window.scrollY > 20;
    }

    isHomePage(): boolean {
        const url = this.router.url.split('?')[0];
        return url === '/public/home' || url === '/public' || url === '/' || url === '';
    }

    ngOnInit(): void {
        this.build();
        this.routerSub = this.router.events
            .pipe(filter(e => e instanceof NavigationEnd))
            .subscribe(() => this.build());
    }

    ngOnDestroy(): void {
        this.routerSub?.unsubscribe();
    }

    // ─────────────────────────────────────────
    // Core logic
    // ─────────────────────────────────────────
    private build(): void {
        const fullUrl = this.router.url.split('?')[0];
        const relUrl = fullUrl.replace(/^\/public/, '') || '/';

        // 1. Get the "structural" trail for this URL from the map
        const mapCrumbs = this.getCrumbsFromMap(relUrl, fullUrl);
        if (!mapCrumbs.length) {
            this.breadcrumbs = [];
            this.history = [];
            this.contextKey = '';
            return;
        }

        // 2. Determine context
        const newContext = getContextKey(relUrl);

        // 3. Special: Post details shouldn't reset history if we are in a portal context (like Saved)
        const isPostDetails = relUrl.includes('/posts/') || relUrl.includes('/details/') || relUrl.includes('/post/');

        if (newContext !== this.contextKey && !isPostDetails) {
            // New root context (e.g. moved from Community to Housing) -> Reset
            this.contextKey = newContext;
            this.history = [...mapCrumbs];
        } else {
            // Same context OR navigating into a Post from another section (keep trail)
            const existingIdx = this.history.findIndex(h => h.url === fullUrl);

            if (existingIdx >= 0) {
                // Navigated back to an earlier crumb in the history
                this.history = this.history.slice(0, existingIdx + 1);
            } else {
                // Navigated deeper. Take ONLY the leaf (last crumb) from the map result
                const leaf = mapCrumbs[mapCrumbs.length - 1];
                if (leaf && !this.history.some(h => h.url === leaf.url)) {
                    this.history = [...this.history, leaf];
                }
            }
        }

        this.breadcrumbs = this.history;
    }

    private getCrumbsFromMap(relUrl: string, fullUrl: string): Breadcrumb[] {
        // Base root for all public pages
        const homeCrumb: Breadcrumb = { label: 'Home', url: '/public/home' };

        for (const route of ROUTE_MAP) {
            const match = relUrl.match(route.match);
            if (match) {
                return [homeCrumb, ...route.crumbs(match, fullUrl)];
            }
        }
        return [];
    }
}
