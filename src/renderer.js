import { Content } from './content.js';

export class ToCRenderer {
  ref;
  element;
  depth;

  constructor(
    ref = document.createElement('div'),
    element = document.querySelector('body'),
    depth = 6,
  ) {
    this.ref = ref;
    this.element = element;
    this.depth = depth;

    this.element.prepend(ref);
  }

  #extractElements(elements, node, content) {
    const tagName = node.tagName ?? '';
    const depth = Number(tagName.replace('H', ''));

    if (Number.isNaN(depth) === false && depth <= this.depth) {
      elements.push(node);
    }

    for (const child of node.children) {
      this.#extractElements(elements, child, content);
    }
  }

  #createContents(elements, contents) {
    let last = null;

    while (elements.length > 0) {
      const element = elements.shift();

      element.id = element.textContent
        .replaceAll('.', '_')
        .replaceAll(' ', '_');

      const depth = Number(element.tagName.replace('H', ''));
      const current = new Content(element.id, depth, element.textContent);

      if (last === null) {
        last = current;
        contents.push(last);
        continue;
      }

      if (last.depth === current.depth) {
        if (last.parent) {
          last.parent.appendChild(current);
          last = current.setParent(last.parent);

          continue;
        }
      }

      if (last.depth < current.depth) {
        last.appendChild(current);
        last = current.setParent(last);

        continue;
      }

      if (last.depth > current.depth) {
        const parent = last.findParentOrderThanCurrentDepth(current.depth);

        if (parent) {
          parent.appendChild(current);
          last = current.setParent(parent);

          continue;
        }
      }

      last = current;
      contents.push(last);
    }
  }

  #contentToElement(elements, content) {
    const anchor = document.createElement('a');

    anchor.innerText = content.title;
    anchor.href = content.href;

    const li = document.createElement('li');

    li.appendChild(anchor);
    li.style.paddingLeft = `${10 * content.depth}px`;

    elements.push(li);

    for (const child of content.children) {
      this.#contentToElement(elements, child);
    }
  }

  #renderContents(contents) {
    const h1 = document.createElement('h1');
    const ul = document.createElement('ul');
    const hr = document.createElement('hr');
    const li = [];

    while (true) {
      const content = contents.shift();

      if (content == null) {
        break;
      }

      this.#contentToElement(li, content);
    }

    h1.innerText = 'Table Of Contents';
    ul.style.padding = 0;
    ul.style.listStyle = 'none';

    ul.append(...li);
    this.ref.append(h1, ul, hr);
  }

  render() {
    const elements = [];
    const contents = [];

    this.#extractElements(elements, this.element, null);
    this.#createContents(elements, contents);
    this.#renderContents(contents);
  }

  remove() {
    const children = Array.from(this.ref.childNodes);

    while (children.length > 0) {
      this.ref.removeChild(children.pop());
    }
  }
}
