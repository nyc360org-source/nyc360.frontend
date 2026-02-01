import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-create-sale',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
<div class="create-housing-container" style="min-height: 80vh; display: flex; align-items: center; justify-content: center; background-color: #F9F5E8; font-family: 'Outfit', sans-serif;">
    <div class="container text-center">
        <div class="placeholder-card p-5 shadow-lg" style="max-width: 600px; margin: 0 auto; border: 1px solid #BC9D5F; background: white; border-radius: 30px;">
            <div class="icon-box mb-4" style="font-size: 4rem; color: #BC9D5F;">
                <i class="bi bi-house-door-fill"></i>
            </div>
            <h2 class="fw-bold mb-3" style="color: #333; font-size: 2.2rem;">Listing for Sale</h2>
            <p class="text-muted mb-5" style="font-size: 1.1rem; line-height: 1.6;">We are currently perfecting the selling flow to ensure you get the best experience for listing your property for sale. This feature will be available very soon!</p>
            <div class="d-flex gap-3 justify-content-center">
                <a routerLink="/public/housing/home" class="btn btn-outline-secondary px-4 py-2 rounded-pill fw-bold">Back Home</a>
                <a routerLink="/public/housing/create/renting" class="btn px-4 py-2 rounded-pill fw-bold" style="background: #BC9D5F; color: white; box-shadow: 0 5px 15px rgba(188, 157, 95, 0.3);">List for Rent Instead</a>
            </div>
        </div>
    </div>
</div>
    `
})
export class CreateSaleComponent { }
