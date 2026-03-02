import Link from "next/link";

export const metadata = {
  title: "Procedimento de Notificação de Violação de Dados | SIGA180",
};

export default function BreachProcedurePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/login" className="text-emerald-600 hover:text-emerald-700 text-sm">&larr; Voltar</Link>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Procedimento de Notificação de Violação de Dados</h1>
        <p className="text-sm text-gray-500 mb-8">Breach Notification Procedure — Art. 33.º e 34.º do RGPD — Versão 1.0, Março 2026</p>

        <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 space-y-8 text-gray-700 text-sm leading-relaxed">

          {/* 1. Objetivo */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">1. Objetivo</h2>
            <p>
              O presente documento define o procedimento interno para deteção, avaliação, contenção e notificação
              de violações de dados pessoais (&quot;data breaches&quot;) no âmbito da plataforma SIGA180, em
              conformidade com os Art. 33.º e 34.º do RGPD.
            </p>
          </section>

          {/* 2. Definição */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">2. Definição de Violação de Dados</h2>
            <p>
              Uma violação de dados pessoais é uma falha de segurança que provoca, de modo acidental ou ilícito,
              a destruição, perda, alteração, divulgação ou acesso não autorizados a dados pessoais (Art. 4.º(12) RGPD).
            </p>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-red-50 rounded-xl p-3 border border-red-200">
                <h4 className="font-semibold text-red-800 text-sm">Confidencialidade</h4>
                <p className="text-xs text-red-700 mt-1">Divulgação ou acesso não autorizados a dados pessoais</p>
              </div>
              <div className="bg-amber-50 rounded-xl p-3 border border-amber-200">
                <h4 className="font-semibold text-amber-800 text-sm">Integridade</h4>
                <p className="text-xs text-amber-700 mt-1">Alteração não autorizada de dados pessoais</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-3 border border-blue-200">
                <h4 className="font-semibold text-blue-800 text-sm">Disponibilidade</h4>
                <p className="text-xs text-blue-700 mt-1">Perda de acesso ou destruição de dados pessoais</p>
              </div>
            </div>
          </section>

          {/* 3. Equipa de Resposta */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">3. Equipa de Resposta a Incidentes</h2>
            <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
              <thead><tr className="bg-gray-50"><th className="py-2 px-3 text-left">Papel</th><th className="py-2 px-3 text-left">Responsável</th><th className="py-2 px-3 text-left">Contacto</th></tr></thead>
              <tbody>
                <tr className="border-t border-gray-100"><td className="py-2 px-3">Responsável pelo tratamento</td><td className="py-2 px-3">João Azul (joaoazuldev)</td><td className="py-2 px-3">rgpd@siga180.pt</td></tr>
                <tr className="border-t border-gray-100"><td className="py-2 px-3">Responsável técnico</td><td className="py-2 px-3">João Azul</td><td className="py-2 px-3">admin@siga180.pt</td></tr>
                <tr className="border-t border-gray-100"><td className="py-2 px-3">Autoridade de controlo</td><td className="py-2 px-3">CNPD</td><td className="py-2 px-3">geral@cnpd.pt | +351 213 928 400</td></tr>
              </tbody>
            </table>
          </section>

          {/* 4. Workflow */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">4. Workflow de Resposta</h2>
            
            <div className="space-y-4">
              {/* Fase 1 */}
              <div className="border-l-4 border-red-500 pl-4">
                <h3 className="font-semibold text-gray-900">Fase 1 — Deteção e Contenção (0–4 horas)</h3>
                <ul className="list-disc ml-4 mt-2 space-y-1">
                  <li>Identificar a natureza e âmbito da violação</li>
                  <li>Conter a violação (revogar acessos, corrigir vulnerabilidade, isolar sistemas)</li>
                  <li>Preservar evidências (logs, snapshots)</li>
                  <li>Registar incidente no painel de admin (<code>/admin/incidents</code>)</li>
                  <li>Classificar a gravidade: <strong>Baixa</strong> / <strong>Média</strong> / <strong>Alta</strong> / <strong>Crítica</strong></li>
                </ul>
              </div>

              {/* Fase 2 */}
              <div className="border-l-4 border-amber-500 pl-4">
                <h3 className="font-semibold text-gray-900">Fase 2 — Avaliação de Risco (4–24 horas)</h3>
                <ul className="list-disc ml-4 mt-2 space-y-1">
                  <li>Determinar categorias de dados afetados</li>
                  <li>Estimar número de titulares afetados</li>
                  <li>Avaliar consequências para os direitos e liberdades dos titulares</li>
                  <li>Determinar se é provável que resulte num risco para os titulares</li>
                  <li>Documentar avaliação no registo de incidentes</li>
                </ul>
                <div className="mt-2 bg-amber-50 rounded-lg p-3 border border-amber-200">
                  <p className="text-xs text-amber-800"><strong>Critério de notificação (Art. 33.º):</strong> Se a violação for suscetível de resultar num risco para os direitos e liberdades das pessoas singulares → notificar CNPD.</p>
                </div>
              </div>

              {/* Fase 3 */}
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold text-gray-900">Fase 3 — Notificação à CNPD (até 72 horas)</h3>
                <p className="mt-2">Se a avaliação determinar que existe risco, notificar a CNPD no prazo máximo de <strong>72 horas</strong> após tomar conhecimento da violação, incluindo:</p>
                <ol className="list-decimal ml-4 mt-2 space-y-1">
                  <li>Natureza da violação (tipo, categorias de dados)</li>
                  <li>Nome e contacto do responsável pelo tratamento</li>
                  <li>Descrição das consequências prováveis</li>
                  <li>Número aproximado de titulares e registos afetados</li>
                  <li>Medidas adotadas ou propostas para conter e remediar</li>
                </ol>
                <div className="mt-2 bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <p className="text-xs text-blue-800"><strong>Canal:</strong> CNPD — <a href="https://www.cnpd.pt" className="underline">www.cnpd.pt</a> — formulário online de notificação de violações | Email: geral@cnpd.pt</p>
                </div>
              </div>

              {/* Fase 4 */}
              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="font-semibold text-gray-900">Fase 4 — Notificação aos Titulares (se risco elevado)</h3>
                <p className="mt-2">Se a violação for suscetível de implicar um <strong>elevado risco</strong> para os direitos e liberdades (Art. 34.º), notificar os titulares afetados:</p>
                <ul className="list-disc ml-4 mt-2 space-y-1">
                  <li>Em linguagem clara e simples</li>
                  <li>Descrevendo a natureza da violação</li>
                  <li>Indicando as medidas adotadas</li>
                  <li>Recomendando precauções ao titular</li>
                  <li>Via email e/ou notificação na plataforma</li>
                </ul>
                <div className="mt-2 bg-purple-50 rounded-lg p-3 border border-purple-200">
                  <p className="text-xs text-purple-800"><strong>Exceções (Art. 34.º(3)):</strong> Não é obrigatório se: (a) os dados estavam encriptados; (b) medidas eliminaram o risco; (c) exigiria esforço desproporcionado (usar comunicação pública).</p>
                </div>
              </div>

              {/* Fase 5 */}
              <div className="border-l-4 border-emerald-500 pl-4">
                <h3 className="font-semibold text-gray-900">Fase 5 — Remediação e Registo (contínuo)</h3>
                <ul className="list-disc ml-4 mt-2 space-y-1">
                  <li>Implementar correções técnicas</li>
                  <li>Atualizar medidas de segurança</li>
                  <li>Documentar toda a violação, avaliação e ações no registo interno de incidentes</li>
                  <li>Realizar post-mortem e atualizar procedimentos se necessário</li>
                  <li>Rever a AIPD se a violação revelar riscos não previstos</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 5. Registo de Violações */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">5. Registo Interno de Violações (Art. 33.º(5))</h2>
            <p>Todas as violações de dados, incluindo as que não exigem notificação à CNPD, são documentadas no registo interno com:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Data e hora da deteção</li>
              <li>Descrição da violação</li>
              <li>Categorias de dados e titulares afetados</li>
              <li>Consequências avaliadas</li>
              <li>Medidas adotadas</li>
              <li>Decisão de notificação (sim/não) com fundamentação</li>
            </ul>
            <p className="mt-2">O registo é mantido no painel de administração da plataforma (<code>/admin/incidents</code>) e conservado por um período mínimo de 5 anos.</p>
          </section>

          {/* 6. Prazos */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">6. Resumo de Prazos</h2>
            <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
              <thead><tr className="bg-gray-50"><th className="py-2 px-3 text-left">Ação</th><th className="py-2 px-3 text-left">Prazo</th><th className="py-2 px-3 text-left">Base Legal</th></tr></thead>
              <tbody>
                <tr className="border-t border-gray-100"><td className="py-2 px-3">Contenção inicial</td><td className="py-2 px-3 font-medium">0–4 horas</td><td className="py-2 px-3">Boas práticas</td></tr>
                <tr className="border-t border-gray-100"><td className="py-2 px-3">Avaliação de risco</td><td className="py-2 px-3 font-medium">até 24 horas</td><td className="py-2 px-3">Boas práticas</td></tr>
                <tr className="border-t border-gray-100"><td className="py-2 px-3">Processador notifica Controlador (PTs)</td><td className="py-2 px-3 font-medium">até 24 horas</td><td className="py-2 px-3">Art. 33.º(2) + DPA</td></tr>
                <tr className="border-t border-gray-100"><td className="py-2 px-3 font-semibold text-red-700">Notificação à CNPD</td><td className="py-2 px-3 font-bold text-red-700">até 72 horas</td><td className="py-2 px-3 font-medium">Art. 33.º(1)</td></tr>
                <tr className="border-t border-gray-100"><td className="py-2 px-3">Notificação aos titulares (se risco elevado)</td><td className="py-2 px-3 font-medium">Sem demora injustificada</td><td className="py-2 px-3">Art. 34.º(1)</td></tr>
              </tbody>
            </table>
          </section>

          {/* 7. Contactos de Emergência */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">7. Contactos de Emergência</h2>
            <div className="bg-red-50 rounded-xl p-4 border border-red-200 space-y-2">
              <p className="text-sm"><strong>Responsável pelo tratamento:</strong> rgpd@siga180.pt</p>
              <p className="text-sm"><strong>Suporte técnico:</strong> admin@siga180.pt</p>
              <p className="text-sm"><strong>CNPD (Comissão Nacional de Proteção de Dados):</strong></p>
              <ul className="list-disc ml-6 text-sm space-y-1">
                <li>Website: <a href="https://www.cnpd.pt" className="text-red-700 underline">www.cnpd.pt</a></li>
                <li>Email: geral@cnpd.pt</li>
                <li>Telefone: +351 213 928 400</li>
                <li>Morada: Rua de São Bento, 148, 3.º, 1200-821 Lisboa</li>
              </ul>
            </div>
          </section>

          {/* 8. Revisão */}
          <section>
            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
              <p className="text-sm"><strong>Versão:</strong> 1.0</p>
              <p className="text-sm"><strong>Aprovado por:</strong> João Azul — Responsável pelo tratamento</p>
              <p className="text-sm"><strong>Data:</strong> Março 2026</p>
              <p className="text-sm"><strong>Próxima revisão:</strong> Março 2027 ou após qualquer incidente</p>
            </div>
          </section>

        </div>

        <div className="flex gap-4 mt-6 text-xs text-gray-400 justify-center">
          <Link href="/privacy" className="hover:text-emerald-600 transition">Privacidade</Link>
          <Link href="/cookies" className="hover:text-emerald-600 transition">Cookies</Link>
          <Link href="/termos" className="hover:text-emerald-600 transition">Termos</Link>
          <Link href="/dpia" className="hover:text-emerald-600 transition">AIPD</Link>
          <Link href="/dpa" className="hover:text-emerald-600 transition">DPA</Link>
        </div>
      </div>
    </div>
  );
}
