export const resetPasswordTemplate = (params: {
  resetLink: string;
  expiresInMinutes: number;
}) => `
  <div style="background-color:#f4f6f8;padding:30px 0;">
    <div style="
      max-width:600px;
      margin:0 auto;
      background-color:#ffffff;
      border-radius:8px;
      padding:30px;
      font-family:Arial, Helvetica, sans-serif;
      color:#333333;
    ">
      <h2 style="margin-top:0;color:#111827;">
        Recuperación de contraseña
      </h2>

      <p style="font-size:15px;line-height:1.6;">
        Recibimos una solicitud para restablecer tu contraseña.
      </p>

      <div style="text-align:center;margin:30px 0;">
        <a href="${params.resetLink}"
          style="
            display:inline-block;
            padding:12px 24px;
            background-color:#2563eb;
            color:#ffffff;
            text-decoration:none;
            border-radius:6px;
            font-weight:bold;
          ">
          Restablecer contraseña
        </a>
      </div>

      <p style="font-size:14px;color:#555555;">
        Este enlace expirará en ${params.expiresInMinutes} minutos.
      </p>

      <hr style="border-top:1px solid #e5e7eb;margin:30px 0;" />

      <p style="font-size:12px;color:#6b7280;">
        Si no solicitaste este cambio, puedes ignorar este correo.
      </p>
    </div>
  </div>
`;
