import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../enviroment/enviroment';

const SYSTEM_PROMPT = `Responde como experto en reciclaje. Sé breve y claro. Máximo 3 frases cortas. No inventes información.`;

@Injectable({ providedIn: 'root' })
export class ChatService {
  private apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';
  private apiKey = environment.GOOGLE_IA_API_KEY;

  constructor(private http: HttpClient) {}

  sendMessage(userMessage: string): Observable<string> {
    const prompt = `\n${SYSTEM_PROMPT}\n\nUsuario: ${userMessage}\n`;
    const body = {
      contents: [
        {
          parts: [
            { text: prompt }
          ]
        }
      ]
    };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'X-goog-api-key': this.apiKey
    });
    return this.http.post<any>(this.apiUrl, body, { headers }).pipe(
      map(res => res?.candidates?.[0]?.content?.parts?.[0]?.text || 'Sin respuesta'),
      catchError(err => throwError(() => err))
    );
  }
}
