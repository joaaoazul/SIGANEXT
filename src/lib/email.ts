import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "SIGA180 <noreply@siga180.pt>";
const APP_NAME = "SIGA180";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// ─── Base HTML wrapper ───
function wrapHtml(content: string) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #f3f4f6; }
  .container { max-width: 560px; margin: 0 auto; padding: 40px 20px; }
  .card { background: #fff; border-radius: 16px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
  .logo { text-align: center; margin-bottom: 24px; }
  .logo-badge { display: inline-block; background: #10b981; color: #fff; font-weight: 700; font-size: 18px; padding: 10px 18px; border-radius: 12px; }
  h1 { color: #111827; font-size: 22px; margin: 0 0 8px; }
  h2 { color: #111827; font-size: 18px; margin: 0 0 8px; }
  p { color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0 0 16px; }
  .code-box { background: #f9fafb; border: 2px dashed #d1d5db; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0; }
  .code { font-size: 32px; font-weight: 700; letter-spacing: 0.3em; color: #111827; }
  .btn { display: inline-block; background: #10b981; color: #fff; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-weight: 600; font-size: 14px; }
  .btn:hover { background: #059669; }
  .footer { text-align: center; margin-top: 24px; }
  .footer p { color: #9ca3af; font-size: 12px; }
  .divider { border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0; }
</style>
</head>
<body>
<div class="container">
  <div class="card">
    <div class="logo"><span class="logo-badge">🏋️ ${APP_NAME}</span></div>
    ${content}
  </div>
  <div class="footer">
    <p>${APP_NAME} — Gestão de Personal Training</p>
  </div>
</div>
</body>
</html>`;
}

// ─── Email: Convite de Atleta ───
export async function sendInviteEmail(params: {
  to: string;
  trainerName: string;
  code: string;
  type: "magic_code" | "magic_link";
  magicLink: string;
}) {
  const { to, trainerName, code, type, magicLink } = params;

  const codeSection = type === "magic_code"
    ? `<div class="code-box"><p style="margin:0 0 8px;color:#6b7280;font-size:13px;">O teu código de convite:</p><div class="code">${code}</div></div>
       <p style="text-align:center;">Ou usa este link direto:</p>
       <p style="text-align:center;"><a href="${magicLink}" class="btn">Criar Conta</a></p>`
    : `<p style="text-align:center;"><a href="${magicLink}" class="btn">Criar Conta</a></p>`;

  const html = wrapHtml(`
    <h1>Foste convidado! 🎉</h1>
    <p><strong>${trainerName}</strong> convidou-te a juntar ao ${APP_NAME} como atleta.</p>
    ${codeSection}
    <hr class="divider">
    <p style="font-size:12px;color:#9ca3af;">Este convite expira em 7 dias. Se não fizeste este pedido, ignora este email.</p>
  `);

  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `${trainerName} convidou-te para o ${APP_NAME}`,
    html,
  });
}

// ─── Email: Boas-vindas (conta criada) ───
export async function sendWelcomeEmail(params: {
  to: string;
  athleteName: string;
  trainerName: string;
}) {
  const { to, athleteName, trainerName } = params;

  const html = wrapHtml(`
    <h1>Bem-vindo, ${athleteName}! 💪</h1>
    <p>A tua conta no ${APP_NAME} foi criada com sucesso.</p>
    <p>O teu treinador <strong>${trainerName}</strong> já pode criar planos de treino e nutrição personalizados para ti.</p>
    <p style="text-align:center;margin-top:20px;"><a href="${APP_URL}/login" class="btn">Aceder à Conta</a></p>
    <hr class="divider">
    <p style="font-size:12px;color:#9ca3af;">Se precisares de ajuda, contacta o teu treinador diretamente.</p>
  `);

  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Bem-vindo ao ${APP_NAME}, ${athleteName}!`,
    html,
  });
}

// ─── Email: Notificação genérica ───
export async function sendNotificationEmail(params: {
  to: string;
  recipientName: string;
  title: string;
  message: string;
  actionUrl?: string;
  actionLabel?: string;
}) {
  const { to, recipientName, title, message, actionUrl, actionLabel } = params;

  const actionHtml = actionUrl
    ? `<p style="text-align:center;margin-top:20px;"><a href="${actionUrl}" class="btn">${actionLabel || "Ver Detalhes"}</a></p>`
    : "";

  const html = wrapHtml(`
    <h2>${title}</h2>
    <p>Olá ${recipientName},</p>
    <p>${message}</p>
    ${actionHtml}
  `);

  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `${APP_NAME} — ${title}`,
    html,
  });
}

// ─── Email: Nova mensagem ───
export async function sendNewMessageEmail(params: {
  to: string;
  recipientName: string;
  senderName: string;
  messagePreview: string;
}) {
  const { to, recipientName, senderName, messagePreview } = params;

  const html = wrapHtml(`
    <h2>Nova mensagem 💬</h2>
    <p>Olá ${recipientName},</p>
    <p><strong>${senderName}</strong> enviou-te uma nova mensagem:</p>
    <div class="code-box" style="border:1px solid #e5e7eb;text-align:left;">
      <p style="color:#374151;margin:0;font-style:italic;">"${messagePreview.slice(0, 200)}${messagePreview.length > 200 ? "..." : ""}"</p>
    </div>
    <p style="text-align:center;"><a href="${APP_URL}/messages" class="btn">Ver Mensagens</a></p>
  `);

  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `${APP_NAME} — Nova mensagem de ${senderName}`,
    html,
  });
}
