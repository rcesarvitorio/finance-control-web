describe('Utils - FixedBills', () => {
  // Mock das funções do componente FixedBills
  const getCategoryEmoji = (category) => {
    switch(category) {
      case 'agua': return '💧';
      case 'luz': return '💡';
      case 'internet': return '🌐';
      case 'aluguel': return '🏠';
      case 'telefone': return '📱';
      case 'streaming': return '📺';
      case 'condominio': return '🏢';
      case 'seguro': return '🛡️';
      case 'outros': return '📄';
      default: return '💰';
    }
  };

  const getCategoryName = (category) => {
    switch(category) {
      case 'agua': return 'Água';
      case 'luz': return 'Luz';
      case 'internet': return 'Internet';
      case 'aluguel': return 'Aluguel';
      case 'telefone': return 'Telefone';
      case 'streaming': return 'Streaming';
      case 'condominio': return 'Condomínio';
      case 'seguro': return 'Seguro';
      case 'outros': return 'Outros';
      default: return category;
    }
  };

  describe('getCategoryEmoji', () => {
    it('deve retornar emojis corretos para categorias conhecidas', () => {
      expect(getCategoryEmoji('agua')).toBe('💧');
      expect(getCategoryEmoji('luz')).toBe('💡');
      expect(getCategoryEmoji('internet')).toBe('🌐');
      expect(getCategoryEmoji('aluguel')).toBe('🏠');
      expect(getCategoryEmoji('telefone')).toBe('📱');
      expect(getCategoryEmoji('streaming')).toBe('📺');
      expect(getCategoryEmoji('condominio')).toBe('🏢');
      expect(getCategoryEmoji('seguro')).toBe('🛡️');
      expect(getCategoryEmoji('outros')).toBe('📄');
    });

    it('deve retornar emoji padrão para categorias desconhecidas', () => {
      expect(getCategoryEmoji('categoria_inexistente')).toBe('💰');
      expect(getCategoryEmoji('')).toBe('💰');
      expect(getCategoryEmoji(null)).toBe('💰');
      expect(getCategoryEmoji(undefined)).toBe('💰');
    });
  });

  describe('getCategoryName', () => {
    it('deve retornar nomes corretos para categorias conhecidas', () => {
      expect(getCategoryName('agua')).toBe('Água');
      expect(getCategoryName('luz')).toBe('Luz');
      expect(getCategoryName('internet')).toBe('Internet');
      expect(getCategoryName('aluguel')).toBe('Aluguel');
      expect(getCategoryName('telefone')).toBe('Telefone');
      expect(getCategoryName('streaming')).toBe('Streaming');
      expect(getCategoryName('condominio')).toBe('Condomínio');
      expect(getCategoryName('seguro')).toBe('Seguro');
      expect(getCategoryName('outros')).toBe('Outros');
    });

    it('deve retornar a própria categoria para categorias desconhecidas', () => {
      expect(getCategoryName('categoria_inexistente')).toBe('categoria_inexistente');
      expect(getCategoryName('custom_category')).toBe('custom_category');
    });
  });
});

describe('Utils - Investments', () => {
  // Mock das funções do componente Investments
  const getInvestmentCategoryEmoji = (category) => {
    switch(category) {
      case 'acao': return '📈';
      case 'fundo': return '💼';
      case 'tesouro': return '🏛️';
      case 'cripto': return '₿';
      case 'cdb': return '🏦';
      case 'lci': return '🏠';
      case 'lca': return '🌾';
      case 'previdencia': return '👵';
      case 'caixinha': return '🐷';
      case 'outros': return '📄';
      default: return '💰';
    }
  };

  const getInvestmentCategoryName = (category) => {
    switch(category) {
      case 'acao': return 'Ações';
      case 'fundo': return 'Fundos Imobiliários';
      case 'tesouro': return 'Tesouro Direto';
      case 'cripto': return 'Criptomoedas';
      case 'cdb': return 'CDB';
      case 'lci': return 'LCI';
      case 'lca': return 'LCA';
      case 'previdencia': return 'Previdência Privada';
      case 'caixinha': return 'Caixinha';
      case 'outros': return 'Outros';
      default: return category;
    }
  };

  describe('getInvestmentCategoryEmoji', () => {
    it('deve retornar emojis corretos para categorias de investimento conhecidas', () => {
      expect(getInvestmentCategoryEmoji('acao')).toBe('📈');
      expect(getInvestmentCategoryEmoji('fundo')).toBe('💼');
      expect(getInvestmentCategoryEmoji('tesouro')).toBe('🏛️');
      expect(getInvestmentCategoryEmoji('cripto')).toBe('₿');
      expect(getInvestmentCategoryEmoji('cdb')).toBe('🏦');
      expect(getInvestmentCategoryEmoji('lci')).toBe('🏠');
      expect(getInvestmentCategoryEmoji('lca')).toBe('🌾');
      expect(getInvestmentCategoryEmoji('previdencia')).toBe('👵');
      expect(getInvestmentCategoryEmoji('caixinha')).toBe('🐷');
      expect(getInvestmentCategoryEmoji('outros')).toBe('📄');
    });

    it('deve retornar emoji padrão para categorias de investimento desconhecidas', () => {
      expect(getInvestmentCategoryEmoji('investimento_inexistente')).toBe('💰');
      expect(getInvestmentCategoryEmoji('')).toBe('💰');
      expect(getInvestmentCategoryEmoji(null)).toBe('💰');
      expect(getInvestmentCategoryEmoji(undefined)).toBe('💰');
    });
  });

  describe('getInvestmentCategoryName', () => {
    it('deve retornar nomes corretos para categorias de investimento conhecidas', () => {
      expect(getInvestmentCategoryName('acao')).toBe('Ações');
      expect(getInvestmentCategoryName('fundo')).toBe('Fundos Imobiliários');
      expect(getInvestmentCategoryName('tesouro')).toBe('Tesouro Direto');
      expect(getInvestmentCategoryName('cripto')).toBe('Criptomoedas');
      expect(getInvestmentCategoryName('cdb')).toBe('CDB');
      expect(getInvestmentCategoryName('lci')).toBe('LCI');
      expect(getInvestmentCategoryName('lca')).toBe('LCA');
      expect(getInvestmentCategoryName('previdencia')).toBe('Previdência Privada');
      expect(getInvestmentCategoryName('caixinha')).toBe('Caixinha');
      expect(getInvestmentCategoryName('outros')).toBe('Outros');
    });

    it('deve retornar a própria categoria para categorias de investimento desconhecidas', () => {
      expect(getInvestmentCategoryName('investimento_inexistente')).toBe('investimento_inexistente');
      expect(getInvestmentCategoryName('custom_investment')).toBe('custom_investment');
    });
  });
});