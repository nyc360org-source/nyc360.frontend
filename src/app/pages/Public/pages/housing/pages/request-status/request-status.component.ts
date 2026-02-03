import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
    selector: 'app-housing-request-status',
    standalone: true,
    imports: [CommonModule],
    providers: [DatePipe],
    templateUrl: './request-status.component.html',
    styleUrls: ['./request-status.component.scss']
})
export class HousingRequestStatusComponent {
    @Input() requestInfo: any;
    @Output() close = new EventEmitter<void>();

    contactTypes = [
        { id: 0, name: 'Email' },
        { id: 1, name: 'Phone' },
        { id: 2, name: 'Text' }
    ];

    householdTypes = [
        { id: 0, name: 'Individual' },
        { id: 1, name: 'Couple' },
        { id: 2, name: 'Single Family' },
        { id: 3, name: 'Multi Family' }
    ];

    statusOptions = [
        { id: 0, name: 'Pending', class: 'bg-warning text-dark', icon: 'bi-hourglass-split' },
        { id: 1, name: 'Contacted', class: 'bg-info text-white', icon: 'bi-telephone-outbound' },
        { id: 2, name: 'In Progress', class: 'bg-primary text-white', icon: 'bi-arrow-repeat' },
        { id: 3, name: 'Closed', class: 'bg-secondary text-white', icon: 'bi-archive' }
    ];

    getLabel(value: number, options: any[]): string {
        const item = options.find(o => o.id === value);
        return item ? item.name : 'Not Specified';
    }

    getStatus(value: number): any {
        return this.statusOptions.find(o => o.id === value) || this.statusOptions[0];
    }

    onClose(event?: Event) {
        if (event) {
            event.stopPropagation();
        }
        this.close.emit();
    }
}
