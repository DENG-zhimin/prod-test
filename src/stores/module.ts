interface Meta {
  display: boolean;
}

interface Menu {
  title: string;
  path: string;
  icon: string;
  color: string;
  name: string; // route name
  meta: Meta;
}

const MainMenu: Menu[] = [
  {
    title: '闪光灯测试',
    path: 'flash',
    icon: 'highlight',
    color: 'green-5',
    name: 'flash',
    meta: {
      display: true,
    },
  },
  {
    title: '数据分析',
    path: 'analysis',
    icon: 'assessment',
    color: 'red-5',
    name: '',
    meta: {
      display: true,
    },
  },
];

export { Menu, MainMenu };
