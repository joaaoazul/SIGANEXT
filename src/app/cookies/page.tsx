"use client";

import Link from "next/link";
import { Cookie, ArrowLeft, Shield, Clock, Lock } from "lucide-react";

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-emerald-600 transition mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center shadow-md">
              <Cookie className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Política de Cookies
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Última atualização: 1 de março de 2026 · Versão 1.0
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="space-y-8">
          {/* Intro */}
          <section>
            <p className="text-gray-700 leading-relaxed">
              A SIGA180 está empenhada na transparência sobre a utilização de cookies. Esta
              política explica o que são cookies, quais utilizamos e porquê.
            </p>
          </section>

          {/* O que são cookies */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Cookie className="w-5 h-5 text-emerald-500" />
              1. O que são Cookies?
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Cookies são pequenos ficheiros de texto armazenados no seu navegador quando visita
              um website. São amplamente utilizados para fazer os websites funcionarem de forma
              mais eficiente, bem como para fornecer informação aos proprietários do site.
            </p>
          </section>

          {/* Cookies que utilizamos */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-500" />
              2. Cookies que utilizamos
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              A SIGA180 utiliza <strong>apenas cookies estritamente necessários</strong> para
              o funcionamento da plataforma. Não utilizamos cookies de rastreamento,
              publicidade, analítica ou de terceiros.
            </p>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-3 font-semibold text-gray-900">Cookie</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-900">Finalidade</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-900">Duração</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-900">Tipo</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="px-4 py-3 font-mono text-xs text-emerald-700 bg-emerald-50/50">token</td>
                    <td className="px-4 py-3 text-gray-700">
                      Autenticação do utilizador. Contém um JSON Web Token (JWT) encriptado
                      que identifica a sessão sem armazenar dados pessoais em texto claro.
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">7 dias</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                        Essencial
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-xs text-emerald-700 bg-emerald-50/50">cookie-consent-ack</td>
                    <td className="px-4 py-3 text-gray-700">
                      Regista que o utilizador foi informado sobre a utilização de cookies
                      (localStorage, não é um cookie HTTP).
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">Indefinido</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                        Essencial
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Segurança */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Lock className="w-5 h-5 text-emerald-500" />
              3. Medidas de Segurança dos Cookies
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              O cookie de autenticação é protegido com as seguintes medidas:
            </p>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">•</span>
                <span><strong>HttpOnly</strong> — Não acessível via JavaScript, prevenindo ataques XSS</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">•</span>
                <span><strong>Secure</strong> — Transmitido apenas via HTTPS em produção</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">•</span>
                <span><strong>SameSite: Lax</strong> — Proteção contra ataques CSRF</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">•</span>
                <span><strong>Assinatura JWT</strong> — Token assinado criptograficamente, impossível de falsificar</span>
              </li>
            </ul>
          </section>

          {/* Cookies de terceiros */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              4. Cookies de terceiros
            </h2>
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <p className="text-emerald-800 leading-relaxed">
                <strong>A SIGA180 não utiliza cookies de terceiros.</strong> Não temos Google Analytics,
                Facebook Pixel, Hotjar, ou qualquer outro serviço de rastreamento ou publicidade.
                A sua navegação na plataforma é completamente privada.
              </p>
            </div>
          </section>

          {/* Controlo */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-500" />
              5. Como controlar os cookies
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Pode controlar e/ou eliminar cookies conforme desejar. Pode eliminar todos os
              cookies já armazenados no seu computador e configurar a maioria dos navegadores
              para impedir a sua colocação.
            </p>
            <p className="text-gray-700 leading-relaxed">
              <strong>Nota:</strong> Se desativar o cookie de autenticação, não poderá iniciar
              sessão na plataforma, uma vez que é estritamente necessário para o funcionamento
              do serviço.
            </p>
          </section>

          {/* Base legal */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              6. Base legal
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Nos termos do Art. 5.º, n.º 3 da Diretiva ePrivacy (2002/58/CE) e da Lei n.º
              41/2004, os cookies estritamente necessários para a prestação de um serviço
              expressamente solicitado pelo utilizador <strong>não necessitam de consentimento
              prévio</strong>. O cookie de autenticação da SIGA180 enquadra-se nesta exceção.
            </p>
          </section>

          {/* Alterações */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              7. Alterações a esta política
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Reservamo-nos o direito de atualizar esta política a qualquer momento. Quaisquer
              alterações serão publicadas nesta página com a data de atualização revista.
            </p>
          </section>

          {/* Contacto */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              8. Contacto
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Para questões sobre esta política de cookies, contacte-nos através de:{" "}
              <a
                href="mailto:privacidade@siga180.pt"
                className="text-emerald-600 underline hover:text-emerald-700"
              >
                privacidade@siga180.pt
              </a>
            </p>
          </section>

          {/* Footer */}
          <div className="pt-6 border-t border-gray-200">
            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              <Link href="/privacy" className="hover:text-emerald-600 transition">
                Política de Privacidade
              </Link>
              <Link href="/termos" className="hover:text-emerald-600 transition">
                Termos de Serviço
              </Link>
            </div>
            <p className="text-xs text-gray-400 mt-3">
              Em conformidade com o Regulamento (UE) 2016/679 (RGPD), a Diretiva ePrivacy
              (2002/58/CE) e a Lei portuguesa n.º 41/2004.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
