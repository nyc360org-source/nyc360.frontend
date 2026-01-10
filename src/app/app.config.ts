import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './Routes/app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';

// 1. استيراد دالة الأنيميشن (مهم جداً لحل الخطأ)
import { provideAnimations } from '@angular/platform-browser/animations';

// 2. استيراد مكتبات جوجل والإنترسبتور
import { SocialAuthServiceConfig, GoogleLoginProvider } from '@abacritt/angularx-social-login';
import { authInterceptor } from './interceptor/auth.interceptor';
import { loaderInterceptor } from './interceptor/loader-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    
    provideClientHydration(withEventReplay()),
    provideHttpClient(withInterceptors([loaderInterceptor])),
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor]) 
    ),

    provideAnimations(),

    //  Google Auth
    {
      provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(
              '498969207883-os0gf7vs10g5rcekdlo6rtd316ubatqc.apps.googleusercontent.com'
            )
          }
        ],
        onError: (err) => {
          console.error('Social Login Error:', err);
        }
      } as SocialAuthServiceConfig,
    }
  ]
};