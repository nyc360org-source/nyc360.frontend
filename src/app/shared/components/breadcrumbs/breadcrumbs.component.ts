import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router, ActivatedRoute, NavigationEnd, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';

export interface Breadcrumb {
    label: string;
    url: string;
}

@Component({
    selector: 'app-breadcrumbs',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './breadcrumbs.component.html',
    styleUrls: ['./breadcrumbs.component.css']
})
export class BreadcrumbsComponent implements OnInit {
    breadcrumbs: Breadcrumb[] = [];

    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private location: Location
    ) { }

    isHomePage(): boolean {
        const url = this.router.url;
        // Only hide on the absolute root or the main public landing
        return url === '/public/home' || url === '/public' || url === '/' || url === '';
    }

    ngOnInit(): void {
        // Initial breadcrumb build
        this.breadcrumbs = this.buildBreadCrumb(this.activatedRoute.root);

        // Listen to route changes
        this.router.events
            .pipe(filter(event => event instanceof NavigationEnd))
            .subscribe(() => {
                this.breadcrumbs = this.buildBreadCrumb(this.activatedRoute.root);
            });
    }

    /**
     * Recursively build breadcrumb trail
     */
    private buildBreadCrumb(route: ActivatedRoute, url: string = '', breadcrumbs: Breadcrumb[] = []): Breadcrumb[] {
        const children: ActivatedRoute[] = route.children;

        if (children.length === 0) {
            return breadcrumbs;
        }

        for (const child of children) {
            const routeURL: string = child.snapshot.url.map(segment => segment.path).join('/');
            let nextUrl = url;

            if (routeURL !== '') {
                nextUrl += `/${routeURL}`;
            }

            const label = child.snapshot.data['breadcrumb'] || this.formatLabel(routeURL);

            // Decisions: Filter out technical segments unless they have an explicit label
            const ignoredSegments = ['public', 'feed', 'posts', 'pages', 'widgets'];
            const segmentExplicitlyNamed = !!child.snapshot.data['breadcrumb'];
            const isIgnored = !segmentExplicitlyNamed && (ignoredSegments.includes(routeURL.toLowerCase()) || !label);

            if (!isIgnored && !breadcrumbs.some(b => b.url === nextUrl)) {
                breadcrumbs.push({ label, url: nextUrl });
            }

            return this.buildBreadCrumb(child, nextUrl, breadcrumbs);
        }

        return breadcrumbs;
    }

    private formatLabel(segment: string): string {
        if (!segment) return '';
        const parts = segment.split('/');
        const lastPart = parts[parts.length - 1];

        return lastPart
            .replace(/-/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase());
    }

    /**
     * Professional Back Navigation
     * Uses browser history for the most intuitive "Go Back" experience.
     */
    goBack(): void {
        if (typeof window !== 'undefined' && window.history.length > 1) {
            this.location.back();
        } else {
            this.router.navigateByUrl('/public/home');
        }
    }

    goForward(): void {
        if (typeof window !== 'undefined') {
            window.history.forward();
        }
    }

}
