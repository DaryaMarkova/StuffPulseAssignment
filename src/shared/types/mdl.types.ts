export type ComponentHandler = {
  upgradeElement: (element: Element, jsClass?: string) => void;
  upgradeElements: (elements: Element | Element[]) => void;
  upgradeDom: (optJsClass?: string, optCssClass?: string) => void;
  downgradeElements: (nodes: Node | NodeList | Node[]) => void;
};
