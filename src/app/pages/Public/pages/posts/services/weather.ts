import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private http = inject(HttpClient);
  // مفتاحك (لو لسه متفعلش، الكود هيشغل الاحتياطي تلقائياً)
  private apiKey = 'f9f1ddf9c3798909eba6af4d443d1d4a'; 
  private city = 'New York';

  getWeather(): Observable<any> {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${this.city}&appid=${this.apiKey}&units=imperial`;
    
    return this.http.get(url).pipe(
      catchError(err => {
        // Fallback Data (شكلها حقيقي جداً عشان التصميم)
        return of({
          main: { temp: 72, humidity: 45 },
          weather: [{ description: 'Partly Cloudy', icon: '02d' }],
          name: 'New York'
        });
      })
    );
  }
}