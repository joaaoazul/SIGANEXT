"use client";

import Link from "next/link";
import { FileText, ArrowLeft, Shield, AlertTriangle, Scale, Users, Ban, CreditCard } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-emerald-600 transition mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center shadow-md">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Termos de Serviço
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
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
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Estes Termos de Serviço (&ldquo;Termos&rdquo;) regulam a utilização da plataforma SIGA180
              (&ldquo;Plataforma&rdquo;, &ldquo;Serviço&rdquo;), disponibilizada pela SIGA180 (&ldquo;nós&rdquo;, &ldquo;nosso&rdquo;).
              Ao aceder ou utilizar a Plataforma, aceita ficar vinculado a estes Termos.
            </p>
          </section>

          {/* 1. Descrição do Serviço */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-500" />
              1. Descrição do Serviço
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
              A SIGA180 é uma plataforma SaaS de gestão para Personal Trainers que permite:
            </p>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">•</span>
                <span>Gestão de clientes e respetivos dados de saúde e fitness</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">•</span>
                <span>Criação e atribuição de planos de treino e nutrição</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">•</span>
                <span>Acompanhamento de progresso e avaliações corporais</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">•</span>
                <span>Agendamento de sessões e comunicação treinador-atleta</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">•</span>
                <span>Gestão de conteúdos e materiais educativos</span>
              </li>
            </ul>
          </section>

          {/* 2. Contas e Registo */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-500" />
              2. Contas e Registo
            </h2>
            <div className="space-y-3 text-gray-700 dark:text-gray-300 leading-relaxed">
              <p>
                <strong>2.1.</strong> Para utilizar a Plataforma, deve criar uma conta fornecendo
                informações verdadeiras, atualizadas e completas.
              </p>
              <p>
                <strong>2.2.</strong> Existem dois tipos de conta: <strong>Personal Trainer (PT)</strong> e
                <strong> Atleta</strong>. A conta PT é criada por auto-registo. A conta Atleta é
                criada pelo PT através de convite.
              </p>
              <p>
                <strong>2.3.</strong> É responsável por manter a confidencialidade das suas credenciais
                de acesso. Qualquer atividade realizada na sua conta é da sua responsabilidade.
              </p>
              <p>
                <strong>2.4.</strong> Deve notificar-nos imediatamente em caso de acesso não autorizado
                à sua conta através de <a href="mailto:suporte@siga180.pt" className="text-emerald-600 underline">suporte@siga180.pt</a>.
              </p>
              <p>
                <strong>2.5.</strong> Deve ter pelo menos 16 anos de idade para criar uma conta,
                em conformidade com o Art. 8.º do RGPD.
              </p>
            </div>
          </section>

          {/* 3. Utilização Aceitável */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Ban className="w-5 h-5 text-emerald-500" />
              3. Utilização Aceitável
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
              Ao utilizar a Plataforma, compromete-se a não:
            </p>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-0.5">✕</span>
                <span>Utilizar a Plataforma para fins ilegais ou não autorizados</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-0.5">✕</span>
                <span>Transmitir vírus, malware ou código malicioso</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-0.5">✕</span>
                <span>Tentar aceder a contas, sistemas ou redes sem autorização</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-0.5">✕</span>
                <span>Fornecer dados de saúde falsos que possam comprometer o acompanhamento</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-0.5">✕</span>
                <span>Partilhar credenciais de acesso com terceiros</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-0.5">✕</span>
                <span>Utilizar a Plataforma para prescrição médica ou diagnóstico clínico</span>
              </li>
            </ul>
          </section>

          {/* 4. Dados de Saúde */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              4. Dados de Saúde e Responsabilidade
            </h2>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
              <p className="text-amber-800 leading-relaxed text-sm">
                <strong>Aviso importante:</strong> A SIGA180 é uma ferramenta de gestão e organização.
                Os planos de treino e nutrição são da exclusiva responsabilidade do Personal Trainer.
                A plataforma não substitui aconselhamento médico profissional.
              </p>
            </div>
            <div className="space-y-3 text-gray-700 dark:text-gray-300 leading-relaxed">
              <p>
                <strong>4.1.</strong> Os dados de saúde (peso, medidas, condições médicas, restrições
                alimentares) são tratados como <strong>dados sensíveis</strong> ao abrigo do Art. 9.º
                do RGPD e processados apenas com consentimento explícito do titular.
              </p>
              <p>
                <strong>4.2.</strong> O Personal Trainer é o <strong>responsável pelo tratamento</strong> dos
                dados dos seus clientes. A SIGA180 atua como <strong>subcontratante</strong> (Art. 28.º RGPD),
                processando dados apenas de acordo com as instruções do PT.
              </p>
              <p>
                <strong>4.3.</strong> O PT compromete-se a obter o consentimento informado dos seus atletas
                antes de inserir dados pessoais e de saúde na Plataforma.
              </p>
            </div>
          </section>

          {/* 5. Propriedade Intelectual */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              5. Propriedade Intelectual
            </h2>
            <div className="space-y-3 text-gray-700 dark:text-gray-300 leading-relaxed">
              <p>
                <strong>5.1.</strong> Todos os direitos de propriedade intelectual da Plataforma
                (design, código, marca, logótipos) pertencem à SIGA180.
              </p>
              <p>
                <strong>5.2.</strong> O conteúdo criado pelos utilizadores (planos de treino, planos
                de nutrição, notas) permanece propriedade do respetivo autor.
              </p>
              <p>
                <strong>5.3.</strong> A SIGA180 não reivindica direitos sobre o conteúdo criado
                pelos utilizadores, utilizando-o apenas para prestação do Serviço.
              </p>
            </div>
          </section>

          {/* 6. Pagamentos */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-500" />
              6. Pagamentos e Subscrição
            </h2>
            <div className="space-y-3 text-gray-700 dark:text-gray-300 leading-relaxed">
              <p>
                <strong>6.1.</strong> A utilização da Plataforma pode estar sujeita ao pagamento
                de uma subscrição, cujos valores e planos são publicados no website.
              </p>
              <p>
                <strong>6.2.</strong> Os pagamentos são processados através de fornecedores de
                pagamento terceiros seguros. A SIGA180 não armazena dados de cartões de crédito.
              </p>
              <p>
                <strong>6.3.</strong> As subscrições são renovadas automaticamente, salvo
                cancelamento prévio pelo utilizador antes do fim do período de faturação.
              </p>
              <p>
                <strong>6.4.</strong> Em caso de reembolso, aplica-se a legislação portuguesa de
                proteção do consumidor e o direito de livre resolução de 14 dias (DL n.º 24/2014).
              </p>
            </div>
          </section>

          {/* 7. Disponibilidade */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              7. Disponibilidade do Serviço
            </h2>
            <div className="space-y-3 text-gray-700 dark:text-gray-300 leading-relaxed">
              <p>
                <strong>7.1.</strong> Envidamos esforços para manter a Plataforma disponível 24/7,
                mas não garantimos disponibilidade ininterrupta.
              </p>
              <p>
                <strong>7.2.</strong> Poderão ocorrer períodos de manutenção programada, sobre os
                quais serão os utilizadores notificados com antecedência razoável.
              </p>
              <p>
                <strong>7.3.</strong> Não somos responsáveis por indisponibilidades causadas por
                terceiros, falhas de internet, força maior ou circunstâncias fora do nosso controlo.
              </p>
            </div>
          </section>

          {/* 8. Limitação de Responsabilidade */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Scale className="w-5 h-5 text-emerald-500" />
              8. Limitação de Responsabilidade
            </h2>
            <div className="space-y-3 text-gray-700 dark:text-gray-300 leading-relaxed">
              <p>
                <strong>8.1.</strong> A SIGA180 não é responsável por danos diretos, indiretos,
                incidentais ou consequentes resultantes da utilização ou impossibilidade de
                utilização da Plataforma.
              </p>
              <p>
                <strong>8.2.</strong> A SIGA180 não é responsável pela adequação, segurança ou
                eficácia dos planos de treino ou nutrição criados pelos Personal Trainers.
              </p>
              <p>
                <strong>8.3.</strong> A nossa responsabilidade total, na máxima extensão permitida
                por lei, está limitada ao valor pago pelo utilizador nos 12 meses anteriores ao evento.
              </p>
            </div>
          </section>

          {/* 9. Suspensão e Cancelamento */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              9. Suspensão e Cancelamento
            </h2>
            <div className="space-y-3 text-gray-700 dark:text-gray-300 leading-relaxed">
              <p>
                <strong>9.1.</strong> Reservamo-nos o direito de suspender ou cancelar contas que
                violem estes Termos, com ou sem aviso prévio.
              </p>
              <p>
                <strong>9.2.</strong> O utilizador pode cancelar a sua conta a qualquer momento
                através das definições da conta ou contactando o suporte.
              </p>
              <p>
                <strong>9.3.</strong> Após o cancelamento, os dados pessoais serão tratados de
                acordo com a nossa{" "}
                <Link href="/privacy" className="text-emerald-600 underline hover:text-emerald-700">
                  Política de Privacidade
                </Link>
                , incluindo o período de retenção de 2 anos.
              </p>
            </div>
          </section>

          {/* 10. Direitos RGPD */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              10. Proteção de Dados
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              O tratamento de dados pessoais é regido pela nossa{" "}
              <Link href="/privacy" className="text-emerald-600 underline hover:text-emerald-700">
                Política de Privacidade
              </Link>
              , que constitui parte integrante destes Termos. Consulte também a nossa{" "}
              <Link href="/cookies" className="text-emerald-600 underline hover:text-emerald-700">
                Política de Cookies
              </Link>
              .
            </p>
          </section>

          {/* 11. Alterações */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              11. Alterações aos Termos
            </h2>
            <div className="space-y-3 text-gray-700 dark:text-gray-300 leading-relaxed">
              <p>
                <strong>11.1.</strong> Reservamo-nos o direito de modificar estes Termos a
                qualquer momento, publicando a versão revista nesta página.
              </p>
              <p>
                <strong>11.2.</strong> Alterações materiais serão comunicadas por email ou
                notificação na Plataforma com pelo menos 30 dias de antecedência.
              </p>
              <p>
                <strong>11.3.</strong> A continuação da utilização após a entrada em vigor das
                alterações constitui aceitação dos novos Termos.
              </p>
            </div>
          </section>

          {/* 12. Lei Aplicável */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              12. Lei Aplicável e Foro
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Estes Termos são regidos pela lei portuguesa. Qualquer litígio será submetido
              à jurisdição dos tribunais portugueses, sem prejuízo dos direitos do consumidor
              previstos na legislação aplicável, incluindo o recurso a mecanismos de resolução
              alternativa de litígios (RAL) e ao Centro Europeu do Consumidor.
            </p>
          </section>

          {/* 13. Contacto */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              13. Contacto
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Para questões sobre estes Termos de Serviço:{" "}
              <a
                href="mailto:suporte@siga180.pt"
                className="text-emerald-600 underline hover:text-emerald-700"
              >
                suporte@siga180.pt
              </a>
            </p>
          </section>

          {/* Footer */}
          <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
              <Link href="/privacy" className="hover:text-emerald-600 transition">
                Política de Privacidade
              </Link>
              <Link href="/cookies" className="hover:text-emerald-600 transition">
                Política de Cookies
              </Link>
            </div>
            <p className="text-xs text-gray-400 mt-3">
              Em conformidade com a legislação portuguesa e o Regulamento (UE) 2016/679 (RGPD).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
