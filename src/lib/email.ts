import { Resend } from "resend";

let _resend: Resend | null = null;
function getResend() {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

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

  return getResend().emails.send({
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

  return getResend().emails.send({
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

  return getResend().emails.send({
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

  return getResend().emails.send({
    from: FROM_EMAIL,
    to,
    subject: `${APP_NAME} — Nova mensagem de ${senderName}`,
    html,
  });
}

// ─── Email: Password redefinida por admin ───
export async function sendPasswordResetEmail(params: {
  to: string;
  recipientName: string;
  newPassword: string;
}) {
  const { to, recipientName, newPassword } = params;

  const html = wrapHtml(`
    <h2>Password Redefinida 🔑</h2>
    <p>Olá ${recipientName},</p>
    <p>A tua password foi redefinida por um administrador.</p>
    <div class="code-box">
      <p style="margin:0 0 8px;color:#6b7280;font-size:13px;">A tua nova password:</p>
      <div class="code" style="font-size:20px;letter-spacing:0.1em;">${newPassword}</div>
    </div>
    <p style="color:#ef4444;font-size:13px;"><strong>⚠️ Por segurança, altera a tua password após o primeiro login.</strong></p>
    <p style="text-align:center;margin-top:20px;"><a href="${APP_URL}/login" class="btn">Iniciar Sessão</a></p>
    <hr class="divider">
    <p style="font-size:12px;color:#9ca3af;">Se não solicitaste esta alteração, contacta o suporte imediatamente.</p>
  `);

  return getResend().emails.send({
    from: FROM_EMAIL,
    to,
    subject: `${APP_NAME} — Password redefinida`,
    html,
  });
}

// ─── Email: Agendamento de sessão ───
export async function sendBookingEmail(params: {
  to: string;
  recipientName: string;
  trainerName: string;
  date: string;
  startTime: string;
  endTime: string;
  notes?: string;
}) {
  const { to, recipientName, trainerName, date, startTime, endTime, notes } = params;

  const notesHtml = notes
    ? `<p style="color:#374151;font-size:13px;"><strong>Notas:</strong> ${notes}</p>`
    : "";

  const html = wrapHtml(`
    <h2>Sessão Agendada 📅</h2>
    <p>Olá ${recipientName},</p>
    <p>O teu treinador <strong>${trainerName}</strong> agendou uma nova sessão para ti:</p>
    <div class="code-box" style="border:1px solid #e5e7eb;text-align:left;">
      <p style="color:#374151;margin:0 0 4px;"><strong>📅 Data:</strong> ${date}</p>
      <p style="color:#374151;margin:0 0 4px;"><strong>🕐 Horário:</strong> ${startTime} — ${endTime}</p>
      ${notesHtml}
    </div>
    <p style="text-align:center;margin-top:20px;"><a href="${APP_URL}/athlete" class="btn">Ver Agendamentos</a></p>
  `);

  return getResend().emails.send({
    from: FROM_EMAIL,
    to,
    subject: `${APP_NAME} — Sessão agendada para ${date}`,
    html,
  });
}

// ─── Email: Conta suspensa ───
export async function sendAccountSuspendedEmail(params: {
  to: string;
  recipientName: string;
}) {
  const { to, recipientName } = params;

  const html = wrapHtml(`
    <h2>Conta Suspensa ⚠️</h2>
    <p>Olá ${recipientName},</p>
    <p>A tua conta no ${APP_NAME} foi suspensa por um administrador.</p>
    <p>Se acreditas que isto foi um erro, contacta o suporte:</p>
    <p style="text-align:center;margin-top:16px;">
      <a href="mailto:suporte@siga180.pt" class="btn" style="background:#f59e0b;">Contactar Suporte</a>
    </p>
  `);

  return getResend().emails.send({
    from: FROM_EMAIL,
    to,
    subject: `${APP_NAME} — Conta suspensa`,
    html,
  });
}

// ─── Email: Conta reativada ───
export async function sendAccountReactivatedEmail(params: {
  to: string;
  recipientName: string;
}) {
  const { to, recipientName } = params;

  const html = wrapHtml(`
    <h2>Conta Reativada ✅</h2>
    <p>Olá ${recipientName},</p>
    <p>A tua conta no ${APP_NAME} foi reativada. Já podes voltar a aceder à plataforma.</p>
    <p style="text-align:center;margin-top:20px;"><a href="${APP_URL}/login" class="btn">Aceder à Conta</a></p>
  `);

  return getResend().emails.send({
    from: FROM_EMAIL,
    to,
    subject: `${APP_NAME} — Conta reativada`,
    html,
  });
}

// ─── Email: Link de recuperação de password ───
export async function sendPasswordResetLinkEmail(params: {
  to: string;
  recipientName: string;
  resetUrl: string;
}) {
  const { to, recipientName, resetUrl } = params;

  const html = wrapHtml(`
    <h2>Recuperação de Password 🔐</h2>
    <p>Olá ${recipientName},</p>
    <p>Recebemos um pedido para redefinir a password da tua conta.</p>
    <p style="text-align:center;margin:24px 0;"><a href="${resetUrl}" class="btn">Redefinir Password</a></p>
    <p style="font-size:12px;color:#9ca3af;">Este link expira em <strong>1 hora</strong>. Se não solicitaste esta alteração, ignora este email.</p>
    <hr class="divider">
    <p style="font-size:11px;color:#9ca3af;word-break:break-all;">Se o botão não funcionar, copia este link: ${resetUrl}</p>
  `);

  return getResend().emails.send({
    from: FROM_EMAIL,
    to,
    subject: `${APP_NAME} — Recuperação de password`,
    html,
  });
}
