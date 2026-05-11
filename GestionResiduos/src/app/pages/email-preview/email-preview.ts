import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-email-preview',
  standalone: true,
  templateUrl: './email-preview.html',
  styleUrl: './email-preview.scss'
})
export class EmailPreviewComponent {
  html = signal(this.getEmailHtml());

  getEmailHtml(): string {
    return `
<!DOCTYPE html>
<html lang=\"es\">
<head>
  <meta charset=\"UTF-8\">
  <title>Recuperación de Contraseña / Activación de Cuenta</title>
  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\"/>
  <style>
    body { background: #f4f6f8; font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 0; }
    .container { max-width: 480px; margin: 40px auto; background: #fff; border-radius: 12px; box-shadow: 0 2px 8px #0001; padding: 32px 24px; }
    .logo { display: block; margin: 0 auto 24px; width: 80px; }
    h1 { color: #2e7d32; font-size: 1.5rem; margin-bottom: 12px; }
    p { color: #444; font-size: 1rem; line-height: 1.6; }
    .button { display: block; width: fit-content; margin: 24px auto 0; background: #2e7d32; color: #fff; text-decoration: none; padding: 12px 32px; border-radius: 6px; font-weight: 600; font-size: 1rem; }
    .footer { margin-top: 32px; text-align: center; color: #888; font-size: 0.9rem; }
  </style>
</head>
<body>
  <div class=\"container\">
    <img class=\"logo\" src=\"https://i.imgur.com/4M34hi2.png\" alt=\"Logo Proyecto\"/>
    <h1>¡Hola, Juan!</h1>
    <p>
      Hemos recibido una solicitud para <b>recuperar tu contraseña</b> en tu cuenta.<br>
      Haz clic en el siguiente botón para continuar:
    </p>
    <a class=\"button\" href=\"https://ejemplo.com/reset?token=123\">Restablecer contraseña</a>
    <p style=\"margin-top:24px;\">
      Si no solicitaste esto, puedes ignorar este correo.<br>
      ¡Gracias por confiar en nuestro servicio!
    </p>
    <div class=\"footer\">
      © 2026 Proyecto Gestión de Residuos
    </div>
  </div>
</body>
</html>
    `;
  }
}
