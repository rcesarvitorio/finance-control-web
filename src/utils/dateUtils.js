/**
 * Gera um array de 12 meses: 3 anteriores + mês atual + 9 meses a frente
 * Útil para comparação histórica e planejamento futuro
 *
 * @returns {Date[]} Array com 12 objetos Date, começando 3 meses atrás
 */
export function getMonthsRange() {
  const now = new Date();
  const months = [];

  // Começar 3 meses atrás
  for (let i = -3; i < 9; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    months.push(d);
  }

  return months;
}

/**
 * Gera um array de 12 meses para frente (mês atual + 11 a frente)
 * Mantido para compatibilidade ou casos específicos
 *
 * @returns {Date[]} Array com 12 objetos Date começando no mês atual
 */
export function getNext12Months() {
  const now = new Date();
  const months = [];

  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    months.push(d);
  }

  return months;
}
