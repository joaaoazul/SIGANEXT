import Link from "next/link";

export const metadata = {
  title: "AIPD — Avaliação de Impacto sobre a Proteção de Dados | SIGA180",
};

export default function DPIAPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/login" className="text-emerald-600 hover:text-emerald-700 text-sm">&larr; Voltar</Link>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Avaliação de Impacto sobre a Proteção de Dados (AIPD)</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Art. 35.º do RGPD (Regulamento (UE) 2016/679) — Última atualização: Março 2026</p>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-xl border border-gray-100 space-y-8 text-gray-700 dark:text-gray-300 text-sm leading-relaxed">

          {/* 1. Identificação do Projeto */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">1. Identificação do Projeto</h2>
            <table className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <tbody>
                <tr className="border-b border-gray-100"><td className="py-2 px-3 bg-gray-50 dark:bg-gray-950 font-medium w-48">Nome do sistema</td><td className="py-2 px-3">SIGA180 — Plataforma de Gestão para Personal Trainers</td></tr>
                <tr className="border-b border-gray-100"><td className="py-2 px-3 bg-gray-50 dark:bg-gray-950 font-medium">Responsável pelo tratamento</td><td className="py-2 px-3">joaoazuldev (entidade individual) — João Azul</td></tr>
                <tr className="border-b border-gray-100"><td className="py-2 px-3 bg-gray-50 dark:bg-gray-950 font-medium">Contacto RPD</td><td className="py-2 px-3">rgpd@siga180.pt</td></tr>
                <tr className="border-b border-gray-100"><td className="py-2 px-3 bg-gray-50 dark:bg-gray-950 font-medium">Data da AIPD</td><td className="py-2 px-3">Março 2026</td></tr>
                <tr><td className="py-2 px-3 bg-gray-50 dark:bg-gray-950 font-medium">Versão</td><td className="py-2 px-3">1.0</td></tr>
              </tbody>
            </table>
          </section>

          {/* 2. Descrição do Tratamento */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">2. Descrição Sistemática do Tratamento</h2>
            <h3 className="font-semibold text-gray-800 mb-2">2.1. Natureza do Tratamento</h3>
            <p>O SIGA180 é uma plataforma SaaS que permite a Personal Trainers (PTs) gerir os seus clientes (atletas), incluindo:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Recolha e armazenamento de dados pessoais e de saúde (anamnese clínica)</li>
              <li>Criação e atribuição de planos de treino e nutrição</li>
              <li>Registo de avaliações corporais, check-ins e progressos</li>
              <li>Comunicação por mensagens internas</li>
              <li>Gestão de marcações / agenda</li>
              <li>Partilha de conteúdos educativos</li>
            </ul>

            <h3 className="font-semibold text-gray-800 mt-4 mb-2">2.2. Âmbito</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li><strong>Titulares:</strong> Personal Trainers (administradores), Atletas/Clientes</li>
              <li><strong>Volume estimado:</strong> &lt; 10.000 titulares na fase inicial</li>
              <li><strong>Geografia:</strong> Portugal (possível expansão UE)</li>
              <li><strong>Período de retenção:</strong> Dados ativos durante a relação contratual. Contas eliminadas: anonimização imediata + purga de registos auxiliares após 2 anos.</li>
            </ul>

            <h3 className="font-semibold text-gray-800 mt-4 mb-2">2.3. Contexto</h3>
            <p>O tratamento ocorre exclusivamente online, em infraestrutura cloud (Supabase/PostgreSQL na UE + Hetzner na Alemanha). O titular fornece dados diretamente à plataforma ou através do PT.</p>

            <h3 className="font-semibold text-gray-800 mt-4 mb-2">2.4. Finalidades</h3>
            <table className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <thead><tr className="bg-gray-50 dark:bg-gray-950"><th className="py-2 px-3 text-left">Finalidade</th><th className="py-2 px-3 text-left">Base Legal</th></tr></thead>
              <tbody>
                <tr className="border-t border-gray-100"><td className="py-2 px-3">Gestão da relação PT–Atleta</td><td className="py-2 px-3">Art. 6.º(1)(b) — Execução de contrato</td></tr>
                <tr className="border-t border-gray-100"><td className="py-2 px-3">Tratamento de dados de saúde (anamnese)</td><td className="py-2 px-3">Art. 9.º(2)(a) — Consentimento explícito</td></tr>
                <tr className="border-t border-gray-100"><td className="py-2 px-3">Planos de treino e nutrição</td><td className="py-2 px-3">Art. 6.º(1)(b) — Execução de contrato</td></tr>
                <tr className="border-t border-gray-100"><td className="py-2 px-3">Comunicações internas</td><td className="py-2 px-3">Art. 6.º(1)(b) — Execução de contrato</td></tr>
                <tr className="border-t border-gray-100"><td className="py-2 px-3">Segurança e audit trail</td><td className="py-2 px-3">Art. 6.º(1)(f) — Interesse legítimo</td></tr>
                <tr className="border-t border-gray-100"><td className="py-2 px-3">Cookies funcionais (autenticação)</td><td className="py-2 px-3">Art. 6.º(1)(f) — Interesse legítimo + ePrivacy</td></tr>
              </tbody>
            </table>
          </section>

          {/* 3. Categorias de Dados */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">3. Categorias de Dados Tratados</h2>
            <table className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <thead><tr className="bg-gray-50 dark:bg-gray-950"><th className="py-2 px-3 text-left">Categoria</th><th className="py-2 px-3 text-left">Dados</th><th className="py-2 px-3 text-left">Sensibilidade</th></tr></thead>
              <tbody>
                <tr className="border-t border-gray-100"><td className="py-2 px-3 font-medium">Identificação</td><td className="py-2 px-3">Nome, email, telefone, data de nascimento, género</td><td className="py-2 px-3">Normal</td></tr>
                <tr className="border-t border-gray-100"><td className="py-2 px-3 font-medium">Credenciais</td><td className="py-2 px-3">Password (hash bcrypt, 12 rounds)</td><td className="py-2 px-3">Normal</td></tr>
                <tr className="border-t border-gray-100"><td className="py-2 px-3 font-medium">Dados físicos</td><td className="py-2 px-3">Peso, altura, % gordura, medidas corporais, fotos</td><td className="py-2 px-3 text-amber-600 font-medium">Saúde (Art. 9.º)</td></tr>
                <tr className="border-t border-gray-100"><td className="py-2 px-3 font-medium">Historial médico</td><td className="py-2 px-3">Condições, medicação, alergias, lesões, cirurgias, tensão arterial, FC</td><td className="py-2 px-3 text-amber-600 font-medium">Saúde (Art. 9.º)</td></tr>
                <tr className="border-t border-gray-100"><td className="py-2 px-3 font-medium">Estilo de vida</td><td className="py-2 px-3">Ocupação, sono, stress, tabagismo, álcool, atividade</td><td className="py-2 px-3">Normal/Saúde</td></tr>
                <tr className="border-t border-gray-100"><td className="py-2 px-3 font-medium">Objetivos</td><td className="py-2 px-3">Objetivos primário/secundário, peso-alvo, motivação</td><td className="py-2 px-3">Normal</td></tr>
                <tr className="border-t border-gray-100"><td className="py-2 px-3 font-medium">Nutrição</td><td className="py-2 px-3">Restrições, alergias alimentares, suplementos</td><td className="py-2 px-3 text-amber-600 font-medium">Saúde (Art. 9.º)</td></tr>
                <tr className="border-t border-gray-100"><td className="py-2 px-3 font-medium">Técnicos</td><td className="py-2 px-3">IP, user-agent (audit logs)</td><td className="py-2 px-3">Normal</td></tr>
              </tbody>
            </table>
          </section>

          {/* 4. Avaliação de Necessidade e Proporcionalidade */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">4. Avaliação de Necessidade e Proporcionalidade</h2>
            <ul className="list-disc ml-6 space-y-2">
              <li><strong>Necessidade:</strong> Todos os dados recolhidos são necessários para a prestação do serviço de personal training. Os dados de saúde são essenciais para criar planos de treino seguros e adequados.</li>
              <li><strong>Proporcionalidade:</strong> Os campos de anamnese são opcionais e podem ser deixados em branco pelo cliente. Apenas se recolhe o que o PT necessita para uma orientação segura.</li>
              <li><strong>Minimização:</strong> Não se recolhem dados como NIF, NISS, CC ou dados bancários. Os cookies utilizados são estritamente necessários (autenticação).</li>
              <li><strong>Limitação de conservação:</strong> Contas eliminadas são anonimizadas de imediato. Registos auxiliares são purgados após 2 anos. Audit logs após 1 ano.</li>
              <li><strong>Direitos dos titulares:</strong> Acesso, retificação, portabilidade (exportação JSON), apagamento (anonimização), revogação de consentimento — todos operacionais via UI.</li>
            </ul>
          </section>

          {/* 5. Riscos Identificados */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">5. Riscos Identificados e Medidas de Mitigação</h2>
            <table className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <thead><tr className="bg-gray-50 dark:bg-gray-950"><th className="py-2 px-3 text-left">Risco</th><th className="py-2 px-3 text-left">Gravidade</th><th className="py-2 px-3 text-left">Probabilidade</th><th className="py-2 px-3 text-left">Medidas de Mitigação</th></tr></thead>
              <tbody>
                <tr className="border-t border-gray-100">
                  <td className="py-2 px-3">Acesso não autorizado a dados de saúde</td>
                  <td className="py-2 px-3 text-red-600">Alta</td>
                  <td className="py-2 px-3 text-amber-600">Média</td>
                  <td className="py-2 px-3">JWT httpOnly+secure, bcrypt 12 rounds, rate limiting, HTTPS obrigatório, audit logs, role-based access</td>
                </tr>
                <tr className="border-t border-gray-100">
                  <td className="py-2 px-3">Violação de dados (data breach)</td>
                  <td className="py-2 px-3 text-red-600">Alta</td>
                  <td className="py-2 px-3 text-amber-600">Baixa</td>
                  <td className="py-2 px-3">Encriptação em trânsito (TLS), DB gerida (Supabase), backups, procedimento de notificação 72h</td>
                </tr>
                <tr className="border-t border-gray-100">
                  <td className="py-2 px-3">PT acede a dados de clientes de outro PT</td>
                  <td className="py-2 px-3 text-amber-600">Média</td>
                  <td className="py-2 px-3 text-amber-600">Baixa</td>
                  <td className="py-2 px-3">Isolamento por managerId — cada PT só vê os seus clientes</td>
                </tr>
                <tr className="border-t border-gray-100">
                  <td className="py-2 px-3">Perda de dados</td>
                  <td className="py-2 px-3 text-amber-600">Média</td>
                  <td className="py-2 px-3 text-green-600">Baixa</td>
                  <td className="py-2 px-3">Backups automáticos do Supabase, export de dados pelo utilizador</td>
                </tr>
                <tr className="border-t border-gray-100">
                  <td className="py-2 px-3">Utilização indevida de dados pelo PT</td>
                  <td className="py-2 px-3 text-amber-600">Média</td>
                  <td className="py-2 px-3 text-amber-600">Média</td>
                  <td className="py-2 px-3">Termos de Serviço, audit logs de acesso, DPA obrigatório</td>
                </tr>
                <tr className="border-t border-gray-100">
                  <td className="py-2 px-3">Falta de consentimento informado</td>
                  <td className="py-2 px-3 text-amber-600">Média</td>
                  <td className="py-2 px-3 text-green-600">Baixa</td>
                  <td className="py-2 px-3">Consentimento granular (geral + saúde), versionamento, mecanismo de re-consentimento</td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* 6. Medidas de Segurança */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">6. Medidas Técnicas e Organizativas (Art. 32.º)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-950 rounded-xl p-4">
                <h3 className="font-semibold text-gray-800 mb-2">Técnicas</h3>
                <ul className="list-disc ml-4 space-y-1">
                  <li>Encriptação em trânsito (TLS 1.2+)</li>
                  <li>Passwords com bcrypt (12 rounds)</li>
                  <li>JWT httpOnly + Secure + SameSite</li>
                  <li>Rate limiting em endpoints sensíveis</li>
                  <li>Security headers (CSP, X-Frame, HSTS)</li>
                  <li>CORS restritivo</li>
                  <li>Soft delete com anonimização</li>
                  <li>Isolamento de dados por managerId</li>
                </ul>
              </div>
              <div className="bg-gray-50 dark:bg-gray-950 rounded-xl p-4">
                <h3 className="font-semibold text-gray-800 mb-2">Organizativas</h3>
                <ul className="list-disc ml-4 space-y-1">
                  <li>Política de privacidade acessível</li>
                  <li>Termos de serviço claros</li>
                  <li>DPA com subprocessadores</li>
                  <li>Procedimento de violação de dados (72h)</li>
                  <li>Audit logging de ações críticas</li>
                  <li>Script de retenção/purga automática</li>
                  <li>Revisão periódica da AIPD</li>
                  <li>Formação de utilizadores (PTs)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 7. Subprocessadores */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">7. Subprocessadores</h2>
            <table className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <thead><tr className="bg-gray-50 dark:bg-gray-950"><th className="py-2 px-3 text-left">Subprocessador</th><th className="py-2 px-3 text-left">Função</th><th className="py-2 px-3 text-left">Localização</th><th className="py-2 px-3 text-left">Garantias</th></tr></thead>
              <tbody>
                <tr className="border-t border-gray-100"><td className="py-2 px-3">Supabase (AWS eu-central-1)</td><td className="py-2 px-3">Base de dados PostgreSQL</td><td className="py-2 px-3">Alemanha (UE)</td><td className="py-2 px-3">SOC2, DPA, RGPD</td></tr>
                <tr className="border-t border-gray-100"><td className="py-2 px-3">Hetzner</td><td className="py-2 px-3">Servidor aplicacional</td><td className="py-2 px-3">Alemanha (UE)</td><td className="py-2 px-3">ISO 27001, DPA</td></tr>
                <tr className="border-t border-gray-100"><td className="py-2 px-3">Resend</td><td className="py-2 px-3">Envio de emails transacionais</td><td className="py-2 px-3">EUA (SCCs)</td><td className="py-2 px-3">DPA, SCCs aplicáveis</td></tr>
              </tbody>
            </table>
          </section>

          {/* 8. Consulta Prévia */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">8. Necessidade de Consulta Prévia (Art. 36.º)</h2>
            <p>
              Após análise dos riscos residuais e das medidas de mitigação implementadas, conclui-se que o risco residual
              é <strong>aceitável</strong> e não se afigura necessária consulta prévia à CNPD. Esta avaliação será revista
              anualmente ou sempre que ocorra alteração significativa no tratamento.
            </p>
          </section>

          {/* 9. Conclusão */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">9. Conclusão e Aprovação</h2>
            <p>
              A presente AIPD conclui que o tratamento de dados pessoais no SIGA180 é necessário, proporcional e que
              os riscos identificados são adequadamente mitigados pelas medidas técnicas e organizativas implementadas.
            </p>
            <div className="mt-4 bg-emerald-50 rounded-xl p-4 border border-emerald-200">
              <p className="text-sm"><strong>Aprovado por:</strong> João Azul — Responsável pelo tratamento</p>
              <p className="text-sm"><strong>Data:</strong> Março 2026</p>
              <p className="text-sm"><strong>Próxima revisão:</strong> Março 2027</p>
            </div>
          </section>

        </div>

        <div className="flex gap-4 mt-6 text-xs text-gray-400 justify-center">
          <Link href="/privacy" className="hover:text-emerald-600 transition">Privacidade</Link>
          <Link href="/cookies" className="hover:text-emerald-600 transition">Cookies</Link>
          <Link href="/termos" className="hover:text-emerald-600 transition">Termos</Link>
          <Link href="/dpa" className="hover:text-emerald-600 transition">DPA</Link>
        </div>
      </div>
    </div>
  );
}
