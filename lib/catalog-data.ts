export type CardState = 'partial' | 'filled' | 'draft';

export type TrademarkRecord = {
  id: string;
  monogram: string;
  name: string;
  owner: string;
  registrationNumber: string;
  classes: string;
  kind: string;
  state: CardState;
  note: string;
};

export const initialTrademarks: TrademarkRecord[] = [
  {
    id: 'record-001',
    monogram: 'К',
    name: 'Кедровый маяк',
    owner: 'ООО «Кедровый контур»',
    registrationNumber: 'CAT-TM-001',
    classes: '16, 35, 41',
    kind: 'Словесный знак',
    state: 'partial',
    note: 'В карточке пока не заполнено описание обозначения.',
  },
  {
    id: 'record-002',
    monogram: 'Р',
    name: 'Речной контур',
    owner: 'ООО «Речной горизонт»',
    registrationNumber: 'CAT-TM-002',
    classes: '36, 43',
    kind: 'Комбинированный знак',
    state: 'filled',
    note: 'Карточка содержит полный набор основных полей.',
  },
  {
    id: 'record-003',
    monogram: 'Я',
    name: 'Янтарная нить',
    owner: 'ООО «Янтарный вектор»',
    registrationNumber: 'CAT-TM-003',
    classes: '30, 32, 43',
    kind: 'Словесный знак',
    state: 'filled',
    note: 'Основные сведения собраны в единой структуре.',
  },
  {
    id: 'record-004',
    monogram: 'Л',
    name: 'Лунный штрих',
    owner: 'АО «Лунный спектр»',
    registrationNumber: 'CAT-TM-004',
    classes: '9, 11, 35',
    kind: 'Изобразительный знак',
    state: 'partial',
    note: 'В карточке пока отсутствует описание изображения.',
  },
  {
    id: 'record-005',
    monogram: 'М',
    name: 'Мятный круг',
    owner: 'АО «Мятный меридиан»',
    registrationNumber: 'CAT-TM-005',
    classes: '3, 5, 35',
    kind: 'Словесный знак',
    state: 'filled',
    note: 'Название, классы и тип обозначения заполнены.',
  },
  {
    id: 'record-006',
    monogram: 'Б',
    name: 'Брусничный путь',
    owner: 'ООО «Брусничный полюс»',
    registrationNumber: 'CAT-TM-006',
    classes: '12, 37, 39',
    kind: 'Комбинированный знак',
    state: 'partial',
    note: 'В карточке указан сокращённый перечень классов.',
  },
  {
    id: 'record-007',
    monogram: 'Т',
    name: 'Тихая волна',
    owner: 'ООО «Тихая форма»',
    registrationNumber: 'CAT-TM-007',
    classes: '16, 35, 42',
    kind: 'Словесный знак',
    state: 'draft',
    note: 'Черновик карточки с минимальным набором полей.',
  },
  {
    id: 'record-008',
    monogram: 'З',
    name: 'Зелёный компас',
    owner: 'АО «Зелёная навигация»',
    registrationNumber: 'CAT-TM-008',
    classes: '9, 16, 41',
    kind: 'Изобразительный знак',
    state: 'draft',
    note: 'Черновик с минимальным набором полей.',
  },
];
