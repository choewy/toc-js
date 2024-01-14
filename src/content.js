export class Content {
  id;
  href;
  depth;
  title;
  parent;
  children;

  constructor(id, depth, title) {
    this.id = id;
    this.href = `#${id}`;
    this.depth = depth;
    this.title = title;
    this.parent = null;
    this.children = [];
  }

  appendChild(child) {
    this.children.push(child);
  }

  setParent(parent) {
    this.parent = parent;

    return this;
  }

  findParentByDepth(depth) {
    let parent = this;

    while (parent) {
      if (parent.depth < depth) {
        break;
      }

      parent = parent.parent;
    }

    return parent;
  }
}
