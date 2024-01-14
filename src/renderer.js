import { Content } from './content.js';

export class ToCRenderer {
  id;
  depth;

  constructor(id, depth) {
    this.id = id;
    this.depth = depth ?? 6;
  }

  #extractElements(elements, node, content) {
    const tagName = node.tagName ?? '';
    const depth = Number(tagName.replace('H', ''));

    if (node.children.length === 0) {
      if (tagName.startsWith('H')) {
        if (depth <= this.depth) {
          elements.push(node);
        }
      }

      return;
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
        const parent = last.findParentByDepth(current.depth);

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
    const body = document.querySelector('body');

    let div = document.getElementById(this.id);

    if (div == null) {
      div = document.createElement('div');
      div.id = this.id;
      body.prepend(div);
    }

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
    div.append(h1, ul, hr);
  }

  render() {
    const elements = [];
    const contents = [];
    const body = document.querySelector('body');

    this.#extractElements(elements, body, null);
    this.#createContents(elements, contents);
    this.#renderContents(contents);
  }

  remove() {
    const div = document.getElementById(this.id);

    if (div == null) {
      return;
    }

    const children = Array.from(div.childNodes);

    while (children.length > 0) {
      div.removeChild(children.pop());
    }
  }
}
